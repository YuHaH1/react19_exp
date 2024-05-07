import {useFormStatus} from "react-dom";

export default ()=>{
    const {pending} = useFormStatus();
    return <button type="submit" disabled={pending} >提交表单</button>
}