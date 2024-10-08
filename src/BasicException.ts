export class BasicException extends Error {
  static CODE = 400
  static SAFE_CHECK = 999999

  private readonly _code: number = BasicException.CODE
  private readonly _msg: string = ''
  private readonly _sourceError: Error | undefined
  private readonly _detail: any = {}

  /**
   * @param msg
   * @param code
   * @param sourceError
   * @param detail
   */
  constructor(msg: string = '', sourceError: Error | undefined = undefined, code: number = BasicException.CODE, detail: any = {}) {
    super(msg)
    this.name = 'BasicException'
    this._msg = msg
    this._code = code
    this._sourceError = sourceError
    this._detail = detail
  }

  get code(): number {
    return this._code
  }

  /**
   * 错误信息
   */
  get msg(): string {
    return this._msg
  }

  /**
   * 其他数据
   */
  get detail(): any {
    return this._detail
  }

  get sourceError(): Error {
    return this._sourceError as Error
  }

  toString(): string {
    return `${this._msg}`
  }
}
