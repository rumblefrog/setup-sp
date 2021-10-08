import * as fs from "fs";

export function parseFile(file: string, defineName: string): string{
  if(defineName !== ""){
      var regex = new RegExp(`\\s*\\#define\\s+${defineName}\\s+(?:\\"|\\')([\\d.]+)`);
  }
  else{
      var regex = /\s*version\s*=\s*(?:\"|\')([\d.]+)/;
  }
  const data = fs.readFileSync(file, 'utf8').split("\n");
  var parsedVersion = "";
  var match: RegExpMatchArray|null;
  for(let line of data){
      match = line.match(regex);
      if(match !== null){
          parsedVersion = match[1].trim();
          break;
      }
  }
  return parsedVersion;
}