"use strict"

class Type {
  constructor(name) {
    this.name = name
  }
}

class compType {
  constructor(types) {
    this.types = types
  }
}

class FunctionSignature {
  constructor(argType, returnType) {
    this.argType = argType
    this.returnType = returnType
  }
}

class Block {
  constructor(parent, args) {
    this.parent = parent
    this.args = args
    this.variables = {}
    this.cmds = []
  }
}

class Function {
  constructor(signature, args, body) {
    this.signature = signature
    this.args = args
    this.body = body
  }
}

class Module {
  constructor(_package, path) {
    this.package = _package
    this.path = path
    this.variables = []
    this.functions = {}
    this.type = []
  }
}

class Value {
  constructor(type, value) {
    this.type = type
    this.value = value
  }
}

class Expression {
  constructor(op, ...params) {
    this.op = op
    this.params = params
  }
}

class Command {
  constructor(id, ...params) {
    this.id = id
    this.params = params
  }
}

let initSign = new FunctionSignature('void', 'void')
let args = []
let body = new Block(null, args)
body.variables['x'] = (new Value('uint', 1))
let expr = new Expression('ADD', 'x', 2)
body.cmds.push(new Command('SET', 'x', expr))
body.cmds.push(new Command('PRINT', 'x'))

let init = new Function(initSign, [], body)

let _module = new Module()
_module.functions['init'] = init

class Engine {
  run (_module) {
    this.call(_module.functions['init'])
  }
  call (_function) {
    let body = _function.body
    for (let cmd of body.cmds) {
      switch (cmd.id) {
        case 'SET':
          // FIXME
          let value = cmd.params[1]
          if (value instanceof Expression) {
            value = this.calc(expr, body)
          }
          body.variables[cmd.params[0]] = value
          break
        case 'PRINT':
          // FIXME
          console.log('SYS.OUT: ' + body.variables[cmd.params[0]])
          break
      }
    }
  }
  calc (expr, body) {
    switch (expr.op) {
      case 'ADD':
      // FIXME
        let p1 = this.lookup(expr.params[0], body)
        let p2 = this.lookup(expr.params[1], body)
        return p1 + p2
    }
  }
  lookup (value, body) {
    // FIXME
    if (typeof(value) == "string") {
      return body.variables[value].value
    } else {
      return value
    }
  }
}
let engine = new Engine();
engine.run(_module)

console.log('Demo End');
