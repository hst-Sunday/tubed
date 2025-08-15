module.exports = {
  apps: [
    {
      name: 'tubed',
      script: 'server.js',
      instances: 'max', // 或者指定具体数量，如 4
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0'
      },
      // 性能监控和日志配置
      max_memory_restart: '2G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      // 重启策略
      max_restarts: 10,
      min_uptime: '10s',
      // 优雅关闭
      kill_timeout: 5000,
      // 健康检查
      health_check_grace_period: 3000,
      // 监控文件变化（生产环境建议关闭）
      watch: false,
      // 忽略监控的目录
      ignore_watch: ['node_modules', 'logs', 'data', 'public/uploads']
    }
  ]
};