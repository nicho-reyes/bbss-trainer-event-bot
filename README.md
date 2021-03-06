# Baseball Superstars 2020 Trainer Discord Bot

## Requirements

- [Node.js](http://nodejs.org/)
- [Discord](https://discordapp.com/) account
- Firebase database

## Installation Steps (if applicable)

1. Clone repo
2. Run `npm install`
3. Add Discord & firebase credentials in a `.env` file
3. Run `node index.js`
4. Interact with your Discord bot via your web browser

## Commands
`!trainer <trainer name>`
  - lists the trainer events for a specific trainer name
`!trainer-add [trainer name] [trainer event] [event rewards]`
  - adds the trainer event

`$gamble`
  - simulates 10+1 premium pull (all UR trainers can be obtained, except limited ones)
  
`$kunio`
   - simulates kunio pull which has a rate of 1%
   
`$<any UR trainer>`

   - simulates a specific UR trainer banner which has a rate of 0.5%  


## License

MIT License

Copyright (c) 2021 Nicho Reyes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

