/**
 * Complex — floating-point complex numbers.
 *
 * Immutable. All methods return new instances.
 */

export class Complex {
  readonly re: number;
  readonly im: number;

  constructor(re: number, im: number = 0) {
    this.re = re;
    this.im = im;
  }

  static readonly ZERO = new Complex(0, 0);
  static readonly ONE = new Complex(1, 0);
  static readonly I = new Complex(0, 1);

  add(other: Complex): Complex {
    return new Complex(this.re + other.re, this.im + other.im);
  }

  sub(other: Complex): Complex {
    return new Complex(this.re - other.re, this.im - other.im);
  }

  mul(other: Complex): Complex {
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re,
    );
  }

  div(other: Complex): Complex {
    const d = other.re * other.re + other.im * other.im;
    if (d === 0) throw new RangeError("Complex division by zero");
    return new Complex(
      (this.re * other.re + this.im * other.im) / d,
      (this.im * other.re - this.re * other.im) / d,
    );
  }

  conj(): Complex {
    return new Complex(this.re, -this.im);
  }

  /** Magnitude (absolute value). */
  abs(): number {
    return Math.hypot(this.re, this.im);
  }

  /** Phase angle in radians, in `(-π, π]`. */
  arg(): number {
    return Math.atan2(this.im, this.re);
  }

  /** e^(this). */
  exp(): Complex {
    const m = Math.exp(this.re);
    return new Complex(m * Math.cos(this.im), m * Math.sin(this.im));
  }

  /** Principal branch of natural log. */
  log(): Complex {
    return new Complex(Math.log(this.abs()), this.arg());
  }

  toString(): string {
    if (this.im === 0) return `${this.re}`;
    if (this.re === 0) return `${this.im}i`;
    const sign = this.im < 0 ? "-" : "+";
    return `${this.re}${sign}${Math.abs(this.im)}i`;
  }
}
