#!/bin/bash

# 为所有 TypeScript 源文件中的本地导入添加 .js 扩展名
find src -name "*.ts" -type f | while read file; do
    # 跳过已经有 .js 的导入
    # 替换 from './xxx' 和 from '../xxx' 为 from './xxx.js' 和 from '../xxx.js'
    sed -i '' -E "s/from '(\\.\\.\\/|\\.\\/)([^']+)'([^.]|$)/from '\\1\\2.js'\\3/g" "$file"
    
    # 清理可能的重复 .js.js
    sed -i '' "s/\\.js\\.js/.js/g" "$file"
    
    echo "Processed: $file"
done

echo "Done! All source files updated with .js extensions"
