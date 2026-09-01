import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../data/store';
import { User } from '../models/user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { generateId } from '../utils/helpers';
import { Role } from '../models/enums';

@Injectable()
export class UsersService {
  private otpCache = new Map<string, string>();
  findAll(): User[] {
    return db.users;
  }

  findById(id: string): User {
    const user = db.users.find(u => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  findOfficerByRole(role: string): User | undefined {
    return db.users.find(u => u.role === role);
  }

  findEligibleOfficers(dept: string, jurisdiction?: string): User[] {
    let officers = db.users.filter(u => 
      u.role === 'officer' && 
      (!dept || u.dept === dept || dept.toLowerCase().includes((u.dept || '').toLowerCase()) || (u.dept || '').toLowerCase().includes(dept.toLowerCase())) &&
      (!jurisdiction || u.jurisdiction === jurisdiction || u.jurisdiction === 'All Mandals' || u.jurisdiction === 'All' || !u.jurisdiction)
    );

    if (officers.length === 0) {
      // Check db.officers (Modern UCSDP Architecture)
      const modernOfficers = (db.officers || []).filter(o => o.status === 'Active');
      if (modernOfficers.length > 0) {
        return modernOfficers.map(o => ({
          id: o.id,
          name: o.name,
          role: Role.OFFICER,
          title: o.designationTitle,
          email: o.email,
          phone: o.phone,
          status: o.status,
          dept: o.departmentId,
          jurisdiction: o.assignedNodeId,
        } as any));
      }
    }

    return officers;
  }

  findFallbackOfficers(dept?: string): User[] {
    if (dept) {
      return db.users.filter(u => u.role === 'officer' && u.dept === dept);
    }
    return db.users.filter(u => u.role === 'officer');
  }

  findAccountForReset(identity: string): any {
    const identityLower = (identity || '').toLowerCase().trim();
    const identityDigits = identityLower.replace(/\D/g, '');

    const user = db.users.find(u =>
      (u.email && u.email.toLowerCase() === identityLower) ||
      (u.id && u.id.toLowerCase() === identityLower) ||
      (u.phone && u.phone.replace(/\D/g, '') === identityDigits && identityDigits.length >= 10) ||
      (u.aadhaar && u.aadhaar.replace(/\D/g, '') === identityDigits && identityDigits.length === 12)
    );

    if (!user) throw new NotFoundException('Account not found');
    if (!user.securityQuestion) throw new BadRequestException('Security question not set');

    return {
      id: user.id,
      name: user.name,
      securityQuestion: user.securityQuestion,
      securityAnswer: user.securityAnswer
    };
  }

  findAllOfficers(): User[] {
    return db.users.filter(u => u.role === 'officer');
  }

  create(createUserDto: CreateUserDto): User {
    const prefix = createUserDto.role === Role.CITIZEN ? 'CIT' : 'EMP';
    const newUser: User = {
      id: generateId(prefix),
      ...createUserDto,
      status: 'Active',
      joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    db.users.push(newUser);
    return newUser;
  }

  update(id: string, updateUserDto: UpdateUserDto): User {
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) throw new NotFoundException('User not found');
    
    db.users[userIndex] = { ...db.users[userIndex], ...updateUserDto };
    return db.users[userIndex];
  }

  suspend(id: string): User {
    const user = this.findById(id);
    user.status = 'Suspended';
    return user;
  }

  restore(id: string): User {
    const user = this.findById(id);
    user.status = 'Active';
    return user;
  }

  requestOtp(phone: string, aadhaar: string): string {
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpCache.set(phone, otp);
    return otp;
  }

  register(createUserDto: CreateUserDto): User {
    if (createUserDto.role === Role.CITIZEN || !createUserDto.role) {
      if (!createUserDto.otp) {
        throw new BadRequestException('Aadhaar OTP is required for citizen registration.');
      }
      const cachedOtp = this.otpCache.get(createUserDto.phone);
      if (cachedOtp !== createUserDto.otp) {
        throw new BadRequestException('Invalid Aadhaar OTP. Registration denied.');
      }
      // OTP verified successfully. Remove from cache to prevent reuse.
      this.otpCache.delete(createUserDto.phone);
    }
    
    createUserDto.role = Role.CITIZEN; // Force role citizen for public register
    const newUser = this.create(createUserDto);

    // Automatic Server-Side Audit Log for Registration
    db.auditLogs.unshift({
      id: `LOG-${Math.floor(Math.random() * 90000 + 10000)}`,
      action: 'User Registered',
      actor: newUser.email,
      role: newUser.role,
      date: new Date().toISOString(),
      details: `New citizen ${newUser.name} registered with verified Aadhaar OTP.`,
      ip: '127.0.0.1'
    });

    return newUser;
  }

  login(loginDto: any): User {
    const identifier = (loginDto.email || loginDto.username || loginDto.loginId || loginDto.identifier || '').toLowerCase().trim();
    const identifierDigits = identifier.replace(/\D/g, '');

    const user = db.users.find(u => {
      const matchIdentity =
        (u.email && u.email.toLowerCase() === identifier) ||
        (u.id && u.id.toLowerCase() === identifier) ||
        (u.phone && u.phone.replace(/\D/g, '') === identifierDigits && identifierDigits.length >= 10) ||
        (u.aadhaar && u.aadhaar.replace(/\D/g, '') === identifierDigits && identifierDigits.length === 12);

      return matchIdentity && u.password === loginDto.password;
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    // Automatic Server-Side Audit Log for Login
    db.auditLogs.unshift({
      id: `LOG-${Math.floor(Math.random() * 90000 + 10000)}`,
      action: 'User Login',
      actor: user.email,
      role: user.role,
      date: new Date().toISOString(),
      details: `User ${user.name} (${user.email}) logged in successfully as ${user.role}.`,
      ip: '127.0.0.1'
    });

    return user;
  }

  remove(id: string): void {
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) throw new NotFoundException('User not found');
    db.users.splice(userIndex, 1);
  }
}
