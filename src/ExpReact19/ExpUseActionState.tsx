import {useActionState, useEffect} from "react";
import ExpUseFormStatus from "./ExpUseFormStatus.tsx";
function updateName(name:string):Promise<string>{
    return new Promise((r)=>{
        setTimeout(()=>{
            if (!name)r("name不能为空")
            r(name)
        },2000)
    })
}
export default ()=>{
    const [state, submitAction, isPending] = useActionState<string>(
        async (previousState:string, formData:unknown) => {
            const state = await updateName(formData.get("name"));
            // handle success
            return state;
        },
        "初始name值",
    );
    return (
        <form action={submitAction}>
            <input type="text" name="name" />
            <ExpUseFormStatus></ExpUseFormStatus>
            {isPending && <div className="loader"></div>}
            {state && <p style={{color:"green"}}>{state}</p>}
        </form>
    );
}