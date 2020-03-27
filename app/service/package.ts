import { Service } from 'egg';
import * as fs from 'fs'
interface IContent {
  content: string;
  requires?: Array<string>;
}
export default class PackageService extends Service {
  async combinations(): Promise<{
    contents: {
      [key: string]: IContent
    }
  }> {
    const json = JSON.parse(fs.readFileSync('./content.json', 'utf-8'));
    // const res: any = await this.ctx.curl(`https://prod-packager-packages.codesandbox.io/v1/combinations` , {
    //   method: 'GET',
    //   data: this.ctx.query,
    //   dataType: "json",
    //   contentType: 'json'
    // })
    return json
  }
}