
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
function userProfileValidate() {
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
        mobilenumber: {
            trim:true,
            isEmpty: {
                errorMessage: 'Invalid Mobile number',
                negated: true
            },
            isLength: {
                options: { min: 10 },
                errorMessage: 'mobile number should contain 10 numbers',
            },
        }
       
    }
    return check

};

module.exports = {
    userValidate,
    userProfileValidate
}