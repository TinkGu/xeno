const path = require('path');
const fs = require('fs-extra');

const content = `---
title: 📝 历史版本记录
toc: content
---

<embed src="../../../../CHANGELOG.md"></embed>
`;

function generateOverview({ outPath }) {
  fs.outputFileSync(path.join(outPath, 'modules/README.md'), content);
}

module.exports = {
  generateOverview,
};
