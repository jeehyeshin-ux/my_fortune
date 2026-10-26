declare module "lunar-javascript" {
  export class Solar {
    static fromYmdHms(y: number, m: number, d: number, hh: number, mm: number, ss: number): Solar;
    getLunar(): Lunar;
  }
  export class Lunar {
    getEightChar(): EightChar;
    getDayInGanZhi(): string;
  }
  export class EightChar {
    getYear(): string;
    getMonth(): string;
  }
}
