type registerInputTypes = "text" | "email" | "password";
function Input({
        name,
        id,
        label,
        parameters, 
        placeholder, 
        type, 
        errMsg, 
        inputChanged
    } : {
        name: string,
        id: string,
        label: string,
        parameters: string,
        placeholder: string,
        type: registerInputTypes,
        errMsg: string,
        inputChanged?: (value: string, type: string) => void
    }) {

    return (
        <div className="flex flex-col">
            <label 
            htmlFor={id}
            className="my-1">
            {label}
            </label>
            <input
            onChange={(e) => inputChanged?.(e.target.value, name)} 
            placeholder={placeholder}
            type={type} 
            name={name}
            id={id}
            className="transition-colors bg-white border rounded-sm px-1 pb-1 hover:bg-blue-50s hover:bg-neutral-100">
            </input>
            <label 
            htmlFor={id}
            className={errMsg.length === 0 ? "my-1 mt-0" : "text-red-500"}>
            {errMsg.length === 0 ? parameters : errMsg}
            </label>
        </div>
    )
}

export default Input;