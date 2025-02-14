//How to intercept localStorage to avoid illegal manipulation of other people's github token
(() => {
    let shieldList = ['codeRun:githubToken'];
    let shieldMethod = ['clear', 'key'];
    ['getItem', 'setItem', 'removeItem', 'clear', 'key'].forEach((method) => {
        let originMethod = window.localStorage[method]
        window.localStorage[method] = function (...args) {
            if (shieldList.includes(args[0]) || shieldMethod.includes(method)) {
                console.log('This operation has been prohibited: ', method)
                return null;
            }
            return originMethod.apply(window.localStorage, args);
        }
    })
})()

// If you also store sensitive information on cookies, you also need to disable cookie operations.
Object.defineProperty(document, 'cookie', {
    configurable: false,
    enumerable: false,
    get() {
        console.log('This operation has been prohibited: ', 'cookie')
        return null;
    }
})