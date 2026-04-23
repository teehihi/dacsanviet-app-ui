const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/'MOMO'/g, "'ZALOPAY'");
  content = content.replace(/Ví điện tử MoMo/g, "Ví điện tử ZaloPay");
  content = content.replace(/MoMo/g, "ZaloPay");
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}

replaceInFile('/Users/tee/UTE/MobileNangCao/CuoiKi/DacSanVietUI/screens/main/CheckoutScreen.tsx');
replaceInFile('/Users/tee/UTE/MobileNangCao/CuoiKi/DacSanVietUI/screens/main/OrderDetailScreen.tsx');
