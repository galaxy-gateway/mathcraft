/**
 * Vector — a fixed-length array of numbers with the usual operations.
 *
 * Immutable. All methods return new instances.
 */

export class Vector {
  readonly values: readonly number[];

  constructor(values: readonly number[]) {
    this.values = [...values];
  }

  static zeros(n: number): Vector {
    return new Vector(new Array(n).fill(0));
  }

  static ones(n: number): Vector {
    return new Vector(new Array(n).fill(1));
  }

  static basis(n: number, i: number): Vector {
    const v = new Array(n).fill(0);
    v[i] = 1;
    return new Vector(v);
  }

  get length(): number {
    return this.values.length;
  }

  get(i: number): number {
    if (i < 0 || i >= this.length) {
      throw new RangeError(`Vector index ${i} out of bounds (length ${this.length})`);
    }
    return this.values[i];
  }

  add(other: Vector): Vector {
    this.#requireSameSize(other);
    return new Vector(this.values.map((v, i) => v + other.values[i]));
  }

  sub(other: Vector): Vector {
    this.#requireSameSize(other);
    return new Vector(this.values.map((v, i) => v - other.values[i]));
  }

  scale(k: number): Vector {
    return new Vector(this.values.map((v) => v * k));
  }

  /** Inner product ⟨this, other⟩. */
  dot(other: Vector): number {
    this.#requireSameSize(other);
    let sum = 0;
    for (let i = 0; i < this.length; i++) sum += this.values[i] * other.values[i];
    return sum;
  }

  /** L² norm. */
  norm(): number {
    return Math.sqrt(this.dot(this));
  }

  /** Normalize to unit length. Throws on zero vector. */
  normalized(): Vector {
    const n = this.norm();
    if (n === 0) throw new RangeError("Cannot normalize the zero vector");
    return this.scale(1 / n);
  }

  /** L∞ (max absolute) norm. */
  normInf(): number {
    let m = 0;
    for (const v of this.values) {
      const a = Math.abs(v);
      if (a > m) m = a;
    }
    return m;
  }

  equals(other: Vector, tolerance = 0): boolean {
    if (this.length !== other.length) return false;
    for (let i = 0; i < this.length; i++) {
      if (Math.abs(this.values[i] - other.values[i]) > tolerance) return false;
    }
    return true;
  }

  toArray(): number[] {
    return [...this.values];
  }

  #requireSameSize(other: Vector): void {
    if (this.length !== other.length) {
      throw new RangeError(
        `Vector size mismatch: ${this.length} vs ${other.length}`,
      );
    }
  }
}
