
(function () {
  
  window.onerror = function (message, source, lineno, colno, error) {
    errorRun();
    window.parent.postMessage({
      type: 'console',
      method: 'string',
      data: [message, source, lineno, colno, error].map(function (item) {
        return handleData(item);
      })
    });
  };

  window.addEventListener('unhandledrejection', function (err) {
    errorRun();
    window.parent.postMessage({
      type: 'console',
      method: 'string',
      data: [handleData(err.reason.stack)]
    });
  });
 
  var errorRun = function errorRun() {
    window.parent.postMessage({
      type: 'errorRun'
    });
  };
  


  var type = function type(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
  };
  


  var stringify = function stringify(data, hasKey, isLast, visited) {
    var contentType = type(data);
    var str = '';
    var len = 0;
    var lastComma = isLast ? '' : ',';

    switch (contentType) {
      case 'object':
        
        if (visited.includes(data)) {
          str += "<span class=\"string\">\u68C0\u6D4B\u5230\u5FAA\u73AF\u5F15\u7528</span>";
        } else {
          visited.push(data);
          var keys = Object.keys(data);
          len = keys.length; // 空对象

          if (len <= 0) {
            
            str += hasKey ? "<span class=\"bracket\">{ }".concat(lastComma, "</span>") : "<div class=\"bracket\">{ }".concat(lastComma, "</div>");
          } else {
            
            str += "<span class=\"el-icon-arrow-right expandBtn\"></span>";
            str += hasKey ? "<span class=\"bracket\">{</span>" : '<div class="bracket">{</div>'; 

            str += '<div class="wrap">'; 

            keys.forEach(function (key, index) {
              var childIsJson = ['object', 'array'].includes(type(data[key])); 

              str += "\n                                <div class=\"object\">\n                                    <span class=\"key\">\"".concat(key, "\"</span>\n                                    <span class=\"colon\">:</span>\n                                    ").concat(stringify(data[key], true, index >= len - 1, visited)).concat(index < len - 1 && !childIsJson ? ',' : '', "\n                                </div>");
            });
            str += '</div>';
            str += "<div class=\"bracket\">}".concat(lastComma, "</div>");
          }
        }

        break;

      case 'array':
        
        if (visited.includes(data)) {
          str += "<span class=\"string\">\u68C0\u6D4B\u5230\u5FAA\u73AF\u5F15\u7528</span>";
        } else {
          visited.push(data);
          len = data.length; 

          if (len <= 0) {
            
            str += hasKey ? "<span class=\"bracket\">[ ]".concat(lastComma, "</span>") : "<div class=\"bracket\">[ ]".concat(lastComma, "</div>");
          } else {
            
            str += "<span class=\"el-icon-arrow-right expandBtn\"></span>";
            str += hasKey ? "<span class=\"bracket\">[</span>" : '<div class="bracket">[</div>';
            str += '<div class="wrap">';
            data.forEach(function (item, index) {
              
              str += "\n                            <div class=\"array\">\n                                ".concat(stringify(item, true, index >= len - 1, visited)).concat(index < len - 1 ? ',' : '', "\n                            </div>");
            });
            str += '</div>';
            str += "<div class=\"bracket\">]".concat(lastComma, "</div>");
          }
        }

        break;

      default:
        
        var res = handleData(data);
        var quotationMarks = res.contentType === 'string' ? '\"' : ''; 

        str += "<span class=\"".concat(res.contentType, "\">").concat(quotationMarks).concat(res.content).concat(quotationMarks, "</span>");
        break;
    }

    return str;
  };
  


  var handleData = function handleData(content) {
    var contentType = type(content);

    switch (contentType) {
      case 'boolean':
        
        content = content ? 'true' : 'false';
        break;

      case 'null':
        
        content = 'null';
        break;

      case 'undefined':
        
        content = 'undefined';
        break;

      case 'symbol':
        
        content = content.toString();
        break;

      case 'function':
        
        content = content.toString();
        break;

      case 'array': 

      case 'object':
        
        content = stringify(content, false, true, [], true);
        break;

      default:
        break;
    }

    return {
      contentType: contentType,
      content: content
    };
  };
  


  var countIndex = {};

  if (sessionStorage.getItem('CONSOLE_COUNT')) {
    countIndex = JSON.parse(sessionStorage.getItem('CONSOLE_COUNT'));
  } 


  var timeData = {};

  var handleArgs = function handleArgs(method, contents) {
    
    if (contents.length > 0) {
      if (type(contents[0]) === 'string') {
        
        var match = contents[0].match(/(%[sdifc])([^%]*)/gm); // "%d年%d月%d日" -> ["%d年", "%d月", "%d日"]

        if (match) {
          
          var sliceArgs = contents.slice(1);
          var strList = []; 

          match.forEach(function (item, index) {
            var placeholder = item.slice(0, 2);
            var arg = sliceArgs[index]; 

            if (arg === undefined) {
              strList.push(item);
              return;
            }

            var newStr = '';

            switch (placeholder) {
              
              case '%s':
                newStr = String(arg) + item.slice(2);
                break;
             
              case '%d':
              case '%i':
                newStr = (type(arg) === 'number' ? parseInt(arg) : 'NaN') + item.slice(2);
                break;
              

              case '%f':
                newStr = (type(arg) === 'number' ? arg : 'NaN') + item.slice(2);
                break;
              

              case '%c':
                newStr = "<span style=\"".concat(arg, "\">").concat(item.slice(2), "</span>");
                break;

              default:
                break;
            }

            strList.push(newStr);
          });
          contents = strList; 

          if (sliceArgs.length > match.length) {
            contents = contents.concat(sliceArgs.slice(match.length));
          }
        }
      }
    } 


    switch (method) {
      
      case 'assert':
        if (contents[0]) {
          contents = null;
        } else {
          method = 'error';
          contents = ['Assertion failed: ' + (contents[1] || 'console.assert')];
        }

        break;
      // 用于计数，输出它被调用了多少次

      case 'count':
        if (contents[0]) {
          if (countIndex[contents[0]] !== undefined) {
            countIndex[contents[0]]++;
          } else {
            countIndex[contents[0]] = 1;
          }

          sessionStorage.setItem('CONSOLE_COUNT', JSON.stringify(countIndex));
          contents = [contents[0] + ': ' + countIndex[contents[0]]];
        } else {
          contents = null;
        }

        break;
      // 计时开始

      case 'time':
        timeData[contents[0]] = Date.now();
        contents = null;
        break;
      // 计时结束

      case 'timeEnd':
        if (timeData[contents[0]]) {
          contents = [contents[0] + ': ' + (Date.now() - timeData[contents[0]]) + ' ms'];
        } else {
          contents = null;
        }

        break;

      default:
        break;
    }

    return {
      method: method,
      args: contents
    };
  }; // 代理console构造函数


  function ProxyConsole() {} // 拦截console的所有方法


  ['debug', 'clear', 'error', 'info', 'log', 'warn', 'dir', 'props', 'group', 'groupEnd', 'dirxml', 'table', 'trace', 'assert', 'count', 'markTimeline', 'profile', 'profileEnd', 'time', 'timeEnd', 'timeStamp', 'groupCollapsed'].forEach(function (method) {
    var originMethod = console[method]; // 设置原型方法

    ProxyConsole.prototype[method] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 发送信息给父窗口
      var res = handleArgs(method, args);

      if (res.args) {
        window.parent.postMessage({
          type: 'console',
          method: res.method,
          data: res.args.map(function (item) {
            return handleData(item);
          })
        });
      } // 调用原始方法


      originMethod.apply(ProxyConsole, args);
    };
  }); // 覆盖原console对象

  window.console = new ProxyConsole();
  /** 
   * javascript comment 
   * @Author: 王林25 
   * @Date: 2021-05-12 18:22:05 
   * @Desc: 监听事件 
   */

  var onMessage = function onMessage(_ref) {
    var _ref$data = _ref.data,
        data = _ref$data === void 0 ? {} : _ref$data;

    // 动态执行代码
    if (data.type === 'command') {
      try {
        // 打印要执行的代码
        console.log('＞ ' + data.data);
        console.log(eval(data.data));
      } catch (error) {
        console.error('js执行出错');
        console.error(error);
      }
    } else if (data.type === 'log_info') {
      // 打印日志
      console.log(data.data);
    } else if (data.type === 'log_error') {
      // 打印错误
      console.error(data.data);
    }
  };

  window.addEventListener('message', onMessage);
})();
