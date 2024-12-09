import { Body, Controller, Delete, Get, Post, Headers, Param } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { SectionService } from './section.service';

@Controller('section')
export class SectionController {
    constructor(private sectionService: SectionService) {}

    @Post('/create')
    createSection(@Body() sectionDto: CreateSectionDto, @Headers('Authorization') authHeader: string) {
        const token = authHeader.split(' ')[1]; 
        return this.sectionService.createSection(sectionDto, token);
    }

    @Get('/get')
    getSections(@Headers('Authorization') authHeader: string) {
        const token = authHeader.split(' ')[1]; 
        return this.sectionService.getSections(token);
    }

    @Post('/update/:id')
    updateSection(@Body() sectionDto: CreateSectionDto, @Param('id') id: string) {
        return this.sectionService.updateSection(sectionDto, id);
    }

    @Delete('/delete/:id')
    deleteSection(@Param('id') id: number) {
        return this.sectionService.deleteSection(id);
    }
}
