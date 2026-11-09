import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BlogService } from './blog.service';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import * as fs from 'fs';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // --- Public Endpoints ---

  @Get()
  findAllPublished(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('language') language?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.blogService.findAllPublished({ category, search, language, page, limit });
  }

  @Get('featured')
  findFeatured(@Query('language') language?: string) {
    return this.blogService.findFeatured(language);
  }

  @Get('categories')
  getCategories(@Query('language') language?: string) {
    return this.blogService.getCategories(language);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  // --- Admin Endpoints (Protected) ---

  @Get('control')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAllAdmin(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('language') language?: string,
    @Query('status') status?: string,
  ) {
    return this.blogService.findAllAdmin({ category, search, language, status });
  }

  @Get('control/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findOneAdmin(@Param('id') id: string) {
    return this.blogService.findOneAdmin(id);
  }

  @Post('control')
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() dto: CreateBlogPostDto) {
    return this.blogService.create(dto);
  }

  @Put('control/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogService.update(id, dto);
  }

  @Delete('control/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }

  @Post('control/upload')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, callback) => {
        const dir = './public/images/blog';
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        callback(null, dir);
      },
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
  }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    // Return public URL path
    return { url: `http://localhost:3000/public/images/blog/${file.filename}` };
  }
}
