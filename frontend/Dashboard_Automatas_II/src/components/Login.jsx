import "./Login.css"

export default function Login() {
    return (
        <main className="main_container">
            <form className="main_form-container" action="">
                <h1>Login</h1>
                <div className="form_field">
                    <label className="label_userName">User Name</label>
                    <input type="text" />
                </div>
                <div className="form_field">
                    <label className="label_password">Password</label>
                    <input type="password" />
                </div>
            </form>
        </main>
    )
}