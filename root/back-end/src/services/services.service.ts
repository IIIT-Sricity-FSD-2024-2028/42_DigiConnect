import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../data/store';
import { GovtService } from '../models/service.model';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { generateId } from '../utils/helpers';

@Injectable()
export class ServicesService {
  findAll(): GovtService[] {
    return db.services;
  }

  findActive(): GovtService[] {
    return db.services.filter(s => s.status === 'Active');
  }

  findById(id: string): GovtService {
    const service = db.services.find(s => s.id === id);
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  create(createServiceDto: CreateServiceDto): GovtService {
    const newService: GovtService = {
      id: generateId('SVC'),
      ...createServiceDto,
      status: createServiceDto.status || 'Active',
      apps: 0
    };
    db.services.push(newService);
    return newService;
  }

  update(id: string, updateServiceDto: UpdateServiceDto): GovtService {
    const index = db.services.findIndex(s => s.id === id);
    if (index === -1) throw new NotFoundException('Service not found');
    
    db.services[index] = { ...db.services[index], ...updateServiceDto };
    return db.services[index];
  }

  toggleStatus(id: string): GovtService {
    const service = this.findById(id);
    service.status = service.status === 'Active' ? 'Inactive' : 'Active';
    return service;
  }
}
