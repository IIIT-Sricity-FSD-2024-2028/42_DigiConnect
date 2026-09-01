import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { CertificatesService } from './certificates.service';
import { db } from '../data/store';

@ApiTags('certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'View or print official digital certificate HTML/PDF' })
  viewCertificate(@Param('id') id: string, @Res() res: Response) {
    const html = this.certificatesService.getCertificateById(id);
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  }

  @Get('application/:appId')
  @ApiOperation({ summary: 'Get certificate metadata for an application' })
  getAppCertificate(@Param('appId') appId: string) {
    const app = db.applications.find((a) => a.id === appId);
    if (!app) {
      throw new NotFoundException(`Application '${appId}' not found.`);
    }

    const certId = (app as any).certificateId;
    if (!certId) {
      throw new NotFoundException(`Certificate has not yet been generated for Application '${appId}'.`);
    }

    return {
      success: true,
      data: {
        certificateId: certId,
        applicationId: app.id,
        citizenName: app.citizenName,
        serviceName: app.serviceName,
        issuedDate: (app as any).certificateIssuedDate || new Date().toISOString(),
        downloadUrl: `/uploads/certificates/${certId}.html`,
        viewUrl: `/api/v1/certificates/${certId}`,
      },
    };
  }
}
