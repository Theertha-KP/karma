
function userValidate() {
    check = {
        fname: {
            trim: true,
            isEmpty: {
                errorMessage: 'Invalid username',
                negated: true
            },
            matches: {
                errorMessage: "Fisrt name should not contain space ",
                options: /^[^\s]{3}/
            }

        },
        email: {
            
            isEmail: {
                errorMessage: 'Invalid email',
            }
        },
        password: {
            trim:true,
            isEmpty: {
                errorMessage: 'Invalid password',
                negated: true
            },
            isLength: {
                options: { min: 8 },
                errorMessage: 'Password should be at least 8 chars',
            },
        },
       
    }
    return check

};

module.exports = {
    userValidate
}