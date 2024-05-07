import {useOptimistic} from "react";
interface Props{
    currentName:string
    onUpdateName:(name:string)=>void
}
function updateName(name:string):Promise<string>{
    return new Promise((r)=>{
        setTimeout(()=>{
            if (!name)r("name不能为空")
            r(name)
        },2000)
    })
}
export default({currentName, onUpdateName}:Props)=> {
    const [optimisticName, setOptimisticName] = useOptimistic(currentName);

    const submitAction = async (formData: { get: (arg0: string) => any; }) => {
        const newName = formData.get("name");
        setOptimisticName(newName);
        const updatedName = await updateName(newName);
        onUpdateName(updatedName);
    };

    return (
        <form action={submitAction}>
            <p>Your name is（currentName）:<span style={{color:"green"}}>{currentName}</span> </p>
            <p>Your name is（optimisticName）: {optimisticName}</p>
            <p>
                <label>Change Name:</label>

                <input
                    type="text"
                    name="name"
                    disabled={currentName !== optimisticName}
                />
            </p>
            <button type="submit">提交</button>
        </form>
    );
}