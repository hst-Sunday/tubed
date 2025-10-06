# 图片转换功能文档

本项目支持动态图片格式转换和尺寸调整功能，基于 [sharp](https://sharp.pixelplumbing.com/) 图片处理库实现。

## 功能特性

- ✅ 支持多种图片格式转换：WebP、JPEG、PNG、AVIF、GIF
- ✅ 支持图片质量调整（1-100）
- ✅ 支持图片尺寸调整（宽度、高度）
- ✅ 支持多种适配模式
- ✅ 自动优化，不放大图片
- ✅ 安全限制，防止滥用

## API 接口设计

### 基础用法

访问图片时，在 URL 后添加查询参数即可实现格式转换：

```
https://domain.com/uploads/demo.png?format=webp
```

### 支持的查询参数

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| `format` | 目标格式 | string | `webp`, `jpeg`, `jpg`, `png`, `avif`, `gif` | 原格式 |
| `quality` | 图片质量 | number | 1-100 | 80 |
| `width` / `w` | 目标宽度（像素） | number | 1-4096 | 原宽度 |
| `height` / `h` | 目标高度（像素） | number | 1-4096 | 原高度 |
| `fit` | 适配模式 | string | `cover`, `contain`, `fill`, `inside`, `outside` | `cover` |

## 使用示例

### 1. 格式转换

将 PNG 图片转换为 WebP 格式：
```
/uploads/demo.png?format=webp
```

将 PNG 图片转换为 JPEG 格式：
```
/uploads/demo.png?format=jpeg
```

将任意格式转换为现代 AVIF 格式：
```
/uploads/demo.png?format=avif
```

### 2. 质量调整

转换为 WebP 并设置质量为 90：
```
/uploads/demo.png?format=webp&quality=90
```

转换为 JPEG 并压缩至质量 60（更小文件）：
```
/uploads/demo.png?format=jpeg&quality=60
```

### 3. 尺寸调整

调整宽度为 800px（高度自动等比缩放）：
```
/uploads/demo.png?width=800
```

调整高度为 600px（宽度自动等比缩放）：
```
/uploads/demo.png?height=600
```

同时指定宽度和高度：
```
/uploads/demo.png?width=800&height=600
```

使用简写参数：
```
/uploads/demo.png?w=800&h=600
```

### 4. 适配模式

- **cover**（默认）：裁剪图片以完全覆盖目标尺寸
```
/uploads/demo.png?width=800&height=600&fit=cover
```

- **contain**：保持完整图片，可能有留白
```
/uploads/demo.png?width=800&height=600&fit=contain
```

- **fill**：拉伸图片填充目标尺寸
```
/uploads/demo.png?width=800&height=600&fit=fill
```

- **inside**：缩小图片至目标尺寸内
```
/uploads/demo.png?width=800&height=600&fit=inside
```

- **outside**：放大图片至包含目标尺寸
```
/uploads/demo.png?width=800&height=600&fit=outside
```

### 5. 组合使用

转换为 WebP、调整尺寸、设置质量：
```
/uploads/demo.png?format=webp&width=1200&quality=85
```

完整示例（缩略图）：
```
/uploads/demo.png?format=webp&width=400&height=300&fit=cover&quality=80
```

响应式图片（多种尺寸）：
```
<!-- 小屏幕 -->
/uploads/demo.png?format=webp&width=640&quality=80

<!-- 中屏幕 -->
/uploads/demo.png?format=webp&width=1024&quality=85

<!-- 大屏幕 -->
/uploads/demo.png?format=webp&width=1920&quality=90
```

## 性能考虑

### 1. 缓存策略

- 转换后的图片会带有 `Cache-Control: public, max-age=31536000, immutable` 头
- CDN 和浏览器会缓存转换结果，后续请求不会重复处理
- 建议为不同的转换参数组合配置 CDN 缓存

### 2. 优化建议

- **使用 WebP 格式**：相比 JPEG/PNG，文件大小可减少 25-35%
- **使用 AVIF 格式**：相比 WebP 更优，但兼容性稍差
- **合理设置质量**：
  - WebP: 80-85 是最佳平衡点
  - JPEG: 75-85 通常足够
  - PNG: 适合需要透明度的场景
- **按需调整尺寸**：避免加载过大的原图
- **预生成常用尺寸**：对于高频访问的图片，可以预先生成并存储常用尺寸

### 3. 安全限制

- 最大宽度/高度：4096px
- 图片不会被放大（`withoutEnlargement: true`）
- 路径必须在 `public/uploads` 目录内
- 只处理图片文件（通过 sharp 自动识别）

## 实际应用场景

### 1. 响应式网站

根据设备屏幕大小加载不同尺寸的图片：

```html
<picture>
  <source 
    media="(max-width: 640px)"
    srcset="/uploads/hero.png?format=webp&width=640&quality=80"
    type="image/webp"
  >
  <source 
    media="(max-width: 1024px)"
    srcset="/uploads/hero.png?format=webp&width=1024&quality=85"
    type="image/webp"
  >
  <img 
    src="/uploads/hero.png?format=webp&width=1920&quality=90"
    alt="Hero image"
  >
</picture>
```

### 2. 缩略图生成

```javascript
// 列表缩略图
const thumbnailUrl = `/uploads/${filename}?format=webp&width=300&height=200&fit=cover&quality=80`

// 预览图
const previewUrl = `/uploads/${filename}?format=webp&width=800&quality=85`

// 全尺寸（仍然优化）
const fullUrl = `/uploads/${filename}?format=webp&quality=90`
```

### 3. 现代化图片格式渐进支持

```html
<picture>
  <!-- 优先使用 AVIF -->
  <source 
    srcset="/uploads/photo.jpg?format=avif&width=1200&quality=85"
    type="image/avif"
  >
  <!-- 回退到 WebP -->
  <source 
    srcset="/uploads/photo.jpg?format=webp&width=1200&quality=85"
    type="image/webp"
  >
  <!-- 最终回退到 JPEG -->
  <img 
    src="/uploads/photo.jpg?format=jpeg&width=1200&quality=85"
    alt="Photo"
  >
</picture>
```

## 错误处理

如果转换失败，API 会返回 500 错误，并在服务器日志中记录详细错误信息。常见错误：

- **文件不存在**：返回 404
- **权限错误**：返回 403（尝试访问非 uploads 目录）
- **无效参数**：会被忽略，使用默认值
- **不支持的格式**：sharp 会尝试处理，失败则返回 500

## 技术实现

接口位于 `app/api/images/[...path]/route.ts`：

1. **参数解析**：从 URL 查询参数中提取转换选项
2. **文件读取**：从磁盘读取原始图片文件
3. **格式转换**：使用 sharp 进行转换和优化
4. **响应返回**：设置正确的 Content-Type 和缓存头

核心代码结构：
```typescript
parseTransformOptions(searchParams)  // 解析查询参数
↓
transformImage(buffer, options)      // 应用转换
↓
return Response with headers         // 返回结果
```

## 扩展功能建议

未来可以考虑添加：

- [ ] 图片旋转（rotate 参数）
- [ ] 图片裁剪（crop 参数）
- [ ] 水印添加
- [ ] 模糊效果（blur 参数）
- [ ] 锐化处理（sharpen 参数）
- [ ] 灰度转换（grayscale 参数）
- [ ] 缓存预热（预生成常用尺寸）
- [ ] 转换队列（异步处理大图）

## 相关资源

- [Sharp 文档](https://sharp.pixelplumbing.com/)
- [WebP 格式介绍](https://developers.google.com/speed/webp)
- [AVIF 格式介绍](https://avif.io/)
- [响应式图片最佳实践](https://web.dev/responsive-images/)

