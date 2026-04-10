/**
 * Rational — exact fractions over BigInt.
 *
 * Every Rational is stored in reduced form with a positive denominator.
 */

import { abs, sign } from "./bigint.ts";

export class Rational {
  readonly num: bigint;
  readonly den: bigint;

  private constructor(num: bigint, den: bigint) {
    this.num = num;
    this.den = den;
  }

  /** Construct from numerator/denominator, reducing and normalizing sign. */
  static of(num: bigint | number, den: bigint | number = 1n): Rational {
    const n = typeof num === "bigint" ? num : BigInt(num);
    const d = typeof den === "bigint" ? den : BigInt(den);
    if (d === 0n) throw new RangeError("Rational denominator must be non-zero");
    const g = gcdBigInt(abs(n), abs(d));
    const signFix = d < 0n ? -1n : 1n;
    return new Rational((n * signFix) / g, (d * signFix) / g);
  }

  static readonly ZERO = Rational.of(0n, 1n);
  static readonly ONE = Rational.of(1n, 1n);

  add(other: Rational): Rational {
    return Rational.of(
      this.num * other.den + other.num * this.den,
      this.den * other.den,
    );
  }

  sub(other: Rational): Rational {
    return Rational.of(
      this.num * other.den - other.num * this.den,
      this.den * other.den,
    );
  }

  mul(other: Rational): Rational {
    return Rational.of(this.num * other.num, this.den * other.den);
  }

  div(other: Rational): Rational {
    if (other.num === 0n) throw new RangeError("Rational division by zero");
    return Rational.of(this.num * other.den, this.den * other.num);
  }

  neg(): Rational {
    return Rational.of(-this.num, this.den);
  }

  equals(other: Rational): boolean {
    return this.num === other.num && this.den === other.den;
  }

  /** Sign: -1, 0, 1. */
  sign(): -1 | 0 | 1 {
    return sign(this.num);
  }

  /** Approximate as a JavaScript number. */
  toNumber(): number {
    return Number(this.num) / Number(this.den);
  }

  toString(): string {
    return this.den === 1n ? `${this.num}` : `${this.num}/${this.den}`;
  }
}

/** Private gcd for BigInts — avoids circular import with domains/01-number-theory. */
function gcdBigInt(a: bigint, b: bigint): bigint {
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a === 0n ? 1n : a;
}
