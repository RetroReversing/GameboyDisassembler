export class CodeBlock {
  constructor (codeBlockWriter) {
    this.codeBlockWriter = codeBlockWriter;
  }
  nop (repeat = 1) { this.codeBlockWriter.nop(repeat); }
  jp () {}
}

export class CodeBlockWriter {

}

export class CodeBlockAssembler extends CodeBlockWriter {

}

export class CodeBlockExecuter extends CodeBlockWriter {

}
