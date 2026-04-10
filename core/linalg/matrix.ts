/**
 * Matrix — dense row-major matrix of numbers.
 *
 * Immutable. All methods return new instances. Layout is row-major so
 * `get(r, c) = data[r * cols + c]`.
 */

import { Vector } from "./vector.ts";

export class Matrix {
  readonly rows: number;
  readonly cols: number;
  readonly data: readonly number[];

  constructor(rows: number, cols: number, data: readonly number[]) {
    if (data.length !== rows * cols) {
      throw new RangeError(
        `Matrix data length ${data.length} does not match ${rows}×${cols}`,
      );
    }
    this.rows = rows;
    this.cols = cols;
    this.data = [...data];
  }

  /** Build from a nested row array. */
  static from(rows: readonly (readonly number[])[]): Matrix {
    const nRows = rows.length;
    if (nRows === 0) return new Matrix(0, 0, []);
    const nCols = rows[0].length;
    const flat: number[] = new Array(nRows * nCols);
    for (let r = 0; r < nRows; r++) {
      if (rows[r].length !== nCols) {
        throw new RangeError("Matrix.from: inconsistent row lengths");
      }
      for (let c = 0; c < nCols; c++) flat[r * nCols + c] = rows[r][c];
    }
    return new Matrix(nRows, nCols, flat);
  }

  static zeros(rows: number, cols: number): Matrix {
    return new Matrix(rows, cols, new Array(rows * cols).fill(0));
  }

  static identity(n: number): Matrix {
    const data = new Array(n * n).fill(0);
    for (let i = 0; i < n; i++) data[i * n + i] = 1;
    return new Matrix(n, n, data);
  }

  static diag(values: readonly number[]): Matrix {
    const n = values.length;
    const data = new Array(n * n).fill(0);
    for (let i = 0; i < n; i++) data[i * n + i] = values[i];
    return new Matrix(n, n, data);
  }

  get(row: number, col: number): number {
    this.#checkIndex(row, col);
    return this.data[row * this.cols + col];
  }

  /** Return a new Matrix with the given cell updated. */
  set(row: number, col: number, value: number): Matrix {
    this.#checkIndex(row, col);
    const next = [...this.data];
    next[row * this.cols + col] = value;
    return new Matrix(this.rows, this.cols, next);
  }

  row(r: number): Vector {
    if (r < 0 || r >= this.rows) {
      throw new RangeError(`row ${r} out of bounds`);
    }
    return new Vector(this.data.slice(r * this.cols, (r + 1) * this.cols));
  }

  col(c: number): Vector {
    if (c < 0 || c >= this.cols) {
      throw new RangeError(`col ${c} out of bounds`);
    }
    const out: number[] = new Array(this.rows);
    for (let r = 0; r < this.rows; r++) out[r] = this.data[r * this.cols + c];
    return new Vector(out);
  }

  add(other: Matrix): Matrix {
    this.#requireSameShape(other);
    const out = new Array(this.data.length);
    for (let i = 0; i < this.data.length; i++) out[i] = this.data[i] + other.data[i];
    return new Matrix(this.rows, this.cols, out);
  }

  sub(other: Matrix): Matrix {
    this.#requireSameShape(other);
    const out = new Array(this.data.length);
    for (let i = 0; i < this.data.length; i++) out[i] = this.data[i] - other.data[i];
    return new Matrix(this.rows, this.cols, out);
  }

  scale(k: number): Matrix {
    return new Matrix(this.rows, this.cols, this.data.map((x) => x * k));
  }

  transpose(): Matrix {
    const out = new Array(this.data.length);
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        out[c * this.rows + r] = this.data[r * this.cols + c];
      }
    }
    return new Matrix(this.cols, this.rows, out);
  }

  /** Matrix–matrix multiplication. */
  mul(other: Matrix): Matrix {
    if (this.cols !== other.rows) {
      throw new RangeError(
        `Matrix multiply shape mismatch: ${this.rows}×${this.cols} * ${other.rows}×${other.cols}`,
      );
    }
    const out = new Array(this.rows * other.cols).fill(0);
    for (let r = 0; r < this.rows; r++) {
      for (let k = 0; k < this.cols; k++) {
        const a = this.data[r * this.cols + k];
        if (a === 0) continue;
        for (let c = 0; c < other.cols; c++) {
          out[r * other.cols + c] += a * other.data[k * other.cols + c];
        }
      }
    }
    return new Matrix(this.rows, other.cols, out);
  }

  /** Matrix–vector multiplication. */
  mulVec(v: Vector): Vector {
    if (v.length !== this.cols) {
      throw new RangeError(
        `Matrix-vector shape mismatch: ${this.rows}×${this.cols} * ${v.length}`,
      );
    }
    const out = new Array(this.rows).fill(0);
    for (let r = 0; r < this.rows; r++) {
      let sum = 0;
      for (let c = 0; c < this.cols; c++) sum += this.data[r * this.cols + c] * v.get(c);
      out[r] = sum;
    }
    return new Vector(out);
  }

  /** Frobenius norm. */
  frobeniusNorm(): number {
    let sum = 0;
    for (const v of this.data) sum += v * v;
    return Math.sqrt(sum);
  }

  equals(other: Matrix, tolerance = 0): boolean {
    if (this.rows !== other.rows || this.cols !== other.cols) return false;
    for (let i = 0; i < this.data.length; i++) {
      if (Math.abs(this.data[i] - other.data[i]) > tolerance) return false;
    }
    return true;
  }

  toArray(): number[][] {
    const out: number[][] = [];
    for (let r = 0; r < this.rows; r++) {
      out.push(this.data.slice(r * this.cols, (r + 1) * this.cols));
    }
    return out;
  }

  #checkIndex(row: number, col: number): void {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      throw new RangeError(
        `Matrix index (${row}, ${col}) out of bounds for ${this.rows}×${this.cols}`,
      );
    }
  }

  #requireSameShape(other: Matrix): void {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new RangeError(
        `Matrix shape mismatch: ${this.rows}×${this.cols} vs ${other.rows}×${other.cols}`,
      );
    }
  }
}
