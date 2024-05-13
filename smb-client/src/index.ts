import { SMB } from "./function";

export { SMB };
// import { exec } from "child_process";
// export class SMB {
//   constructor(
//     private shared: string,
//     private username: string,
//     private password: string,
//     private domain: string
//   ) {}

//   putFile(remoteFolder: string, fileName: string) {
//     // `smbclient //10.15.5.4/it-data$ -U titi.cha -c 'cd TESTApp; put "${newFileName}"' --password "For+ever16!" -W energyabsolute --max-protocol SMB3`;
//     const c = `smbclient ${this.shared} -U ${this.username} -c 'cd ${remoteFolder}; put "${fileName}"' --password "${this.password}" -W ${this.domain} --max-protocol SMB3`;
//     exec(c, () => (error: any, stdout: any, stderr: any) => {
//       if (error) {
//         console.error(`Error: ${error.message}`);
//         return;
//       }
//       console.log(`stdout: ${stdout}`);
//       console.error(`stderr: ${stderr}`);
//     });

//     return remoteFolder + fileName;
//   }

//   downloadFile(remoteFolder: string, fileName: string): Promise<string> {
//     return new Promise((resolve, reject) => {
//       const d = `smbclient ${this.shared} -U ${this.username} -c 'cd ${remoteFolder}; get "${fileName}"' --password "${this.password}" -W ${this.domain} --max-protocol SMB3`;
//       exec(d, () => (error: any, stdout: any, stderr: any) => {
//         if (error) {
//           console.error(`Error: ${error.message}`);
//           return;
//         }
//         console.log(`stdout: ${stdout}`);
//         console.error(`stderr: ${stderr}`);
//         resolve(fileName);
//         // return fileName;
//       });
//     });
//   }
// }

// export default module;
