import {defineConfig} from "vite";

import react from '@vitejs/plugin-react';



export default defineConfig(({ command}:{command:"serve"|"build"}) => {
    if (command === 'serve') {
        return {
            // dev 配置
            plugins:[react()]
        }
    } else {
        // command === 'build'
        return {
            // build 配置
            plugins:[react()]
        }
    }
})