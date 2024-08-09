import { exec, execSync } from "child_process";

export class SMB {
  constructor(
    private shared: string,
    private username: string,
    private password: string,
    private domain: string
  ) { }

  putFolder(remoteFolder: string, localFolder: string) {
    const c = `smbclient ${this.shared} -U ${this.username}%${this.password} -W ${this.domain} -c "prompt; recurse;cd file_backup;mkdir ${remoteFolder};cd ${remoteFolder};  lcd ${localFolder}; mput *"`
    execSync(c)
  }

  putFile(remoteFolder: string, fileName: string) {
    // `smbclient //10.15.5.4/it-data$ -U titi.cha -c 'cd TESTApp; put "${newFileName}"' --password "For+ever16!" -W energyabsolute --max-protocol SMB3`;
    const c = `smbclient ${this.shared} -U ${this.username} -c 'cd ${remoteFolder}; put "${fileName}"' --password "${this.password}" -W ${this.domain} --max-protocol SMB3`;
    exec(c, () => (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
  }



  async downloadFile(
    remoteFolder: string,
    fileName: string,
    localFolder: string
  ): Promise<any> {
    try {
      const d = `smbclient ${this.shared} -U ${this.username} -c 'cd ${remoteFolder}; lcd ${localFolder}; get "${fileName}"' --password "${this.password}" -W ${this.domain} --max-protocol SMB3`;
      const bufferDownload = execSync(d);
      return true;
    } catch (err) {
      return false;
    }
  }
}
