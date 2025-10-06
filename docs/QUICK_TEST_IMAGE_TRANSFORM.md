# 🚀 图片转换功能快速测试指南

本指南将帮助你快速测试新添加的图片转换功能。

## 📦 前置条件

确保已安装 `sharp` 依赖（已自动添加）：

```bash
# 如果需要重新安装
npm install
```

## 🎯 快速测试步骤

### 1. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3001` 启动。

### 2. 上传一张测试图片

1. 访问 `http://localhost:3001/login`
2. 使用你的 AUTH_CODE 登录
3. 上传一张测试图片（例如：demo.png）
4. 记下上传后的 URL，例如：`/uploads/demo_1234567890_abcdef.png`

### 3. 测试格式转换

在浏览器中访问以下 URL（将 `demo.png` 替换为你的图片路径）：

#### 基础格式转换

```
# 转换为 WebP
http://localhost:3001/uploads/demo.png?format=webp

# 转换为 JPEG
http://localhost:3001/uploads/demo.png?format=jpeg

# 转换为 AVIF（现代格式）
http://localhost:3001/uploads/demo.png?format=avif
```

#### 格式转换 + 质量调整

```
# WebP，质量 90
http://localhost:3001/uploads/demo.png?format=webp&quality=90

# JPEG，质量 60（压缩）
http://localhost:3001/uploads/demo.png?format=jpeg&quality=60
```

#### 尺寸调整

```
# 宽度 800px
http://localhost:3001/uploads/demo.png?format=webp&width=800

# 宽度 800px，高度 600px
http://localhost:3001/uploads/demo.png?format=webp&width=800&height=600

# 缩略图
http://localhost:3001/uploads/demo.png?format=webp&width=300&height=200&fit=cover
```

#### 完整示例

```
# 优化的响应式图片
http://localhost:3001/uploads/demo.png?format=webp&width=1200&quality=85&fit=cover
```

### 4. 使用交互式示例页面

在浏览器中打开示例页面（需要将文件复制到 public 目录）：

```bash
# 方法 1：直接在浏览器中打开
open docs/image-transform-example.html

# 方法 2：通过开发服务器访问（需先复制到 public）
cp docs/image-transform-example.html public/
# 然后访问：http://localhost:3001/image-transform-example.html
```

## 🔍 验证功能

### 方法 1：浏览器开发者工具

1. 打开浏览器开发者工具（F12）
2. 访问转换后的图片 URL
3. 查看 **Network** 标签：
   - Content-Type 应该显示转换后的格式（例如 `image/webp`）
   - 查看文件大小对比

### 方法 2：命令行测试

使用 curl 查看响应头：

```bash
# 查看原始图片
curl -I http://localhost:3001/uploads/demo.png

# 查看转换后的图片
curl -I "http://localhost:3001/uploads/demo.png?format=webp&width=800"
```

### 方法 3：性能对比

比较不同格式的文件大小：

```bash
# 下载原始图片
curl -o original.png http://localhost:3001/uploads/demo.png

# 下载 WebP 版本
curl -o converted.webp "http://localhost:3001/uploads/demo.png?format=webp&quality=85"

# 查看文件大小
ls -lh original.png converted.webp
```

## 📊 预期结果

### ✅ 成功标志

- **格式转换**：Content-Type 正确显示为目标格式
- **文件大小**：转换为 WebP/AVIF 后文件通常减小 25-35%
- **质量**：视觉质量保持良好（quality=85 时）
- **缓存**：响应头包含 `Cache-Control: public, max-age=31536000, immutable`
- **日志**：服务器控制台显示转换信息

### 🔍 服务器日志示例

```
[Image API] Raw params: [ 'demo.png' ]
[Image API] Requesting: demo.png
[Image API] File path: /path/to/public/uploads/demo.png
[Image API] Exists: true
[Image API] Transform options: { format: 'webp', quality: 85, width: 800 }
[Image API] Transformed to image/webp
```

## 🐛 常见问题

### 1. 图片不显示（404）

**原因**：图片路径错误或文件不存在

**解决**：
- 确认图片已上传到 `public/uploads/` 目录
- 检查路径拼写是否正确
- 查看服务器日志

### 2. 图片未转换（返回原格式）

**原因**：查询参数可能有误

**解决**：
- 确认 URL 中的 `?` 和 `&` 使用正确
- 检查参数名称拼写（format, quality, width 等）
- 查看服务器日志中的 "Transform options"

### 3. 服务器错误（500）

**原因**：sharp 处理失败或文件损坏

**解决**：
- 检查图片文件是否完整
- 查看服务器完整错误日志
- 尝试使用其他图片测试

### 4. sharp 模块未找到

**原因**：依赖未正确安装

**解决**：
```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 如果使用 Docker
docker-compose build --no-cache
```

## 🎨 实际应用示例

### 在 React 组件中使用

```tsx
// components/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 85,
  format = 'webp'
}: OptimizedImageProps) {
  const params = new URLSearchParams();
  if (format) params.append('format', format);
  if (quality) params.append('quality', quality.toString());
  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  
  const imageUrl = `${src}?${params.toString()}`;
  
  return (
    <img 
      src={imageUrl}
      alt={alt}
      loading="lazy"
      style={{ width: '100%', height: 'auto' }}
    />
  );
}

// 使用
<OptimizedImage 
  src="/uploads/photo.png"
  alt="My Photo"
  width={800}
  quality={85}
  format="webp"
/>
```

### 在 HTML 中使用响应式图片

```html
<picture>
  <!-- 小屏幕 -->
  <source 
    media="(max-width: 640px)"
    srcset="/uploads/hero.png?format=webp&width=640&quality=80"
    type="image/webp"
  >
  
  <!-- 中屏幕 -->
  <source 
    media="(max-width: 1024px)"
    srcset="/uploads/hero.png?format=webp&width=1024&quality=85"
    type="image/webp"
  >
  
  <!-- 大屏幕 -->
  <img 
    src="/uploads/hero.png?format=webp&width=1920&quality=90"
    alt="Hero Image"
  >
</picture>
```

## 📚 相关文档

- [完整图片转换文档](./IMAGE_TRANSFORM.md)
- [交互式示例页面](./image-transform-example.html)
- [项目 README](../README.md)

## 🎯 下一步

- ✅ 测试不同格式转换
- ✅ 对比文件大小和质量
- ✅ 在实际项目中集成使用
- ✅ 配置 CDN 缓存策略
- ✅ 监控转换性能

## 💡 性能优化建议

1. **选择合适的格式**
   - WebP：平衡性能和兼容性（推荐）
   - AVIF：最佳压缩率，但兼容性较差
   - JPEG：传统格式，兼容性最好

2. **质量设置**
   - 80-85：日常使用最佳平衡点
   - 90-95：需要高质量时使用
   - 60-70：需要快速加载时使用

3. **尺寸策略**
   - 提供多种尺寸以适应不同屏幕
   - 使用 `<picture>` 标签实现响应式
   - 考虑设备像素比（2x、3x）

4. **缓存策略**
   - 利用 CDN 缓存转换后的图片
   - 为常用尺寸预生成图片
   - 监控缓存命中率

祝测试顺利！🎉

