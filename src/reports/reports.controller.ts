import { Body, Controller, Query, Get, Post, UseGuards, Patch, Param } from "@nestjs/common";
import { CreateReportDto } from "./dtos/create-report.dto";
import { reportDto } from "./dtos/report.dto";
import { Serialize } from "../interceptors/serialize.interceptor";
import { ReportsService } from "./reports.service";
import { AuthGuard } from "../guards/auth.guard";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { User } from "../users/user.entity";
import { ApproveReportDto } from "./dtos/approve-report.dto";
import { AdminGuard } from "../guards/admin.guard";
import { GetEstimateDto } from "./dtos/get-estimate.dto";

@Controller("reports")
export class ReportsController {
  constructor(private reportsService: ReportsService) {
  }

  @Post()
  @UseGuards(AuthGuard)
  @Serialize(reportDto)
  createReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
    return this.reportsService.create(body, user);
  }

  @Patch('/:id')
  @UseGuards(AdminGuard)
  approvedReport(@Param('id') id: string, @Body() body: ApproveReportDto) {
    return this.reportsService.changeApproval(id, body.approved)
  }

  @Get()
  getEstimate(@Query() query: GetEstimateDto) {
    return this.reportsService.createEstimate(query)
  }
}
