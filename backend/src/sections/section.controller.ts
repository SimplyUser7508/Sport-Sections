import { Body, Controller, Delete, Get, Post, Headers, Param, Query } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { SectionService } from './section.service';

@Controller('api/section')
export class SectionController {
    constructor(private sectionService: SectionService) {}

    @Post('/create')
    createSection(@Body() sectionDto: CreateSectionDto, @Headers('Authorization') authHeader: string) {
        return this.sectionService.createSection(sectionDto, authHeader);
    }

    @Get('/get')
    getSections(
        @Headers('Authorization') authHeader: string, 
        @Query('page') page: number = 1, 
        @Query('limit') limit: number = 5  
    ) {
        return this.sectionService.getSections(authHeader, page, limit);
    }

    @Post('/update/:id')
    updateSection(@Body() sectionDto: CreateSectionDto, @Param('id') id: string) {
        return this.sectionService.updateSection(sectionDto, id);
    }

    @Delete('/delete/:id') 
    deleteSection(@Param('id') id: string) {
        return this.sectionService.deleteSection(id);
    }
}
