#!/bin/bash

# 为所有 TypeScript 文件中的本地导入添加 .js 扩展名
find src -name "*.ts" -type f | while read file; do
    # 备份原文件
    cp "$file" "$file.bak"
    
    # 替换本地导入，添加 .js 扩展名
    # 匹配 from './xxx' 或 from '../xxx' 但不包含已有 .js 的
    sed -i '' -E "s/from '(\\.\\.\\/|\\.\\/)([^']+)'/from '\\1\\2.js'/g" "$file"
    
    # 移除重复的 .js.js
    sed -i '' "s/\\.js\\.js/.js/g" "$file"
    
    echo "Processed: $file"
done

echo "Done!"
