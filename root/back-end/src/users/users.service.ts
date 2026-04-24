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
    return db.users.filter(u => 
      u.role === 'officer' && 
      u.dept === dept &&
      (!jurisdiction || u.jurisdiction === jurisdiction || u.jurisdiction === 'All Mandals' || u.jurisdiction === 'All' || !u.jurisdiction)
    );
  }

  findFallbackOfficers(dept?: string): User[] {
    if (dept) {
      return db.users.filter(u => u.role === 'officer' && u.dept === dept);
    }
    return db.users.filter(u => u.role === 'officer');
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
    return this.create(createUserDto);
  }

  login(loginDto: any): User {
    const user = db.users.find(u => u.email.toLowerCase() === loginDto.email.toLowerCase() && u.password === loginDto.password);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    return user;
  }

  remove(id: string): void {
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) throw new NotFoundException('User not found');
    db.users.splice(userIndex, 1);
  }
}
