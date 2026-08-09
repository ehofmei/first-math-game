export interface Clock {
  now(): number;
  today(): string;
}

function localDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export class SystemClock implements Clock {
  now(): number {
    return Date.now();
  }

  today(): string {
    return localDateKey(this.now());
  }
}

export class FakeClock implements Clock {
  constructor(private timestamp: number) {}

  now(): number {
    return this.timestamp;
  }

  today(): string {
    return localDateKey(this.timestamp);
  }

  advance(milliseconds: number): void {
    this.timestamp += milliseconds;
  }
}
