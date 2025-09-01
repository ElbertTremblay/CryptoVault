@echo off
title CryptoVault - Confidential DeFi Platform
color 0A

echo.
echo ███████╗██████╗ ██╗   ██╗██████╗ ████████╗ ██████╗ ██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗
echo ██╔════╝██╔══██╗╚██╗ ██╔╝██╔══██╗╚══██╔══╝██╔═══██╗██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝
echo ██║     ██████╔╝ ╚████╔╝ ██████╔╝   ██║   ██║   ██║██║   ██║███████║██║   ██║██║     ██║   
echo ██║     ██╔══██╗  ╚██╔╝  ██╔═══╝    ██║   ██║   ██║╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║   
echo ╚██████╗██║  ██║   ██║   ██║        ██║   ╚██████╔╝ ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║   
echo  ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝        ╚═╝    ╚═════╝   ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   
echo.
echo                              🔐 Confidential DeFi Platform 🔐
echo                                Powered by Zama FHE Protocol
echo.
echo ================================================================================
echo.
echo 正在启动 CryptoVault 平台...
echo.
echo 📦 检查依赖项...

if not exist "node_modules" (
    echo ❌ 未找到 node_modules，正在安装依赖项...
    npm install
)

if not exist "frontend\node_modules" (
    echo ❌ 未找到前端依赖项，正在安装...
    cd frontend && npm install && cd ..
)

echo ✅ 依赖项检查完成
echo.
echo 🚀 启动本地区块链网络...
start "Hardhat Network" cmd /c "npx hardhat node"

echo 等待网络启动...
timeout /t 5 /nobreak > nul

echo.
echo 📝 部署智能合约...
call npm run deploy-local

echo.
echo 🌐 启动前端应用 (端口 3023)...
echo.
echo ================================================================================
echo 🎉 CryptoVault 平台已启动！
echo.
echo 📱 前端地址: http://localhost:3023
echo 🔗 本地网络: http://localhost:8545 (链ID: 31337)
echo.
echo 💡 使用以下测试账户连接 MetaMask:
echo    账户: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
echo    私钥: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
echo.
echo 🔒 特性:
echo    ✓ 私密投资 - 投资金额完全加密
echo    ✓ 机密交易 - DEX 订单大小隐藏  
echo    ✓ 匿名参与 - 保护财务隐私
echo    ✓ FHE 加密 - Zama 同态加密技术
echo.
echo ================================================================================
echo.

cd frontend
set PORT=3023
set DANGEROUSLY_DISABLE_HOST_CHECK=true
set SKIP_PREFLIGHT_CHECK=true
npm start