#!/bin/bash

# 为编译后的 .js 文件中的本地导入添加 .js 扩展名
find dist -name "*.js" -type f | while read file; do
    # 替换本地导入，添加 .js 扩展名
    sed -i '' -E "s/from '(\\.\\.\\/|\\.\\/)([^']+)'/from '\\1\\2.js'/g" "$file"
    
    # 移除重复的 .js.js
    sed -i '' "s/\\.js\\.js/.js/g" "$file"
    
    echo "Processed: $file"
done

echo "Done!"
