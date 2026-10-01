/********************************************************************
 *  Copyright 2025 Adobe
 *  All Rights Reserved.
 *
 * NOTICE:  Adobe permits you to use, modify, and distribute this 
 * file in accordance with the terms of the Adobe license agreement 
 * accompanying it. 
 *******************************************************************/

module.exports = {
  name: 'Newsletter',
  api: {
    root: './src/api',
    importAliasRoot: '@/newsletter/api',
  },
  components: [
    {
      id: 'Components',
      root: './src/components',
      importAliasRoot: '@/newsletter/components',
      cssPrefix: 'newsletter',
      default: true,
    },
  ],
  containers: {
    root: './src/containers',
    importAliasRoot: '@/newsletter/containers',
  },
  schema: {
    endpoint: process.env.ENDPOINT,
    headers: {}
  }
};
