// checks if the slected length is zero or not if it is it make it go back to its natural state


//  function that displays the number.of boxes selected;

async function reload(){
    try{
    let message=await axios.get("http://localhost:3001/reload")
    console.log(message.data.message);
        const tasks=message.data.message;
    for(let i=0;i<tasks.length;i++){
        if(tasks[i].done!=="1")
        addTask1(tasks[i].message);
        else{
            completedtask1(tasks[i].message);
        }
    }
    
}catch(error){
    console.error("error has occured");
}
}
reload();
function ListeningTodo(){
    const deleteBtn=document.querySelector('.delete');
    const completeBtn=document.querySelector('.complete');
    deleteBtn.style.display='block';
    completeBtn.style.display='block';
    const checkboxes=document.querySelectorAll(".taskcreate input[type=checkbox]");
   const selectedBoxes=Array.from(checkboxes).filter(checkbox=>checkbox.checked);
   const sub=document.querySelector('.todosub');
   if (selectedBoxes.length==0){
    sub.textContent="TO DO";
    deleteBtn.style.display='none';
    completeBtn.style.display='none';
}else{
    sub.textContent=`${selectedBoxes.length} Selected`;
}
    
}
//  adding tasks from the Add tab to the todo tab;
document.querySelector(".addingValue").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {

        event.preventDefault(); 
        addtask(); 
        
    }
});
//for listenign todo checkbox
document.querySelector(".taskcreate").addEventListener("click", (event) => {
    if (event.target.matches("input[type=checkbox]")) {
        ListeningTodo();
        
    }
});
//for listening completed checkbox
document.querySelector(".listele").addEventListener("click", (event) => {
    if (event.target.matches("input[type=checkbox]")) {
        ListeningCompleted();
    }
});
async function addtask(){
    try{
    const value=document.querySelector(".addingValue").value;
    const empty=document.querySelector(".addingValue");
    empty.value="";
    const response=await axios.post('http://localhost:3001/add',{
        value:value
        
    })

    console.log(response);
    const div=document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    const label=document.createElement("label");
    if(value==""){
        alert("enter something");
    }else{
    label.textContent=value;
    label.prepend(checkbox);
    checkbox.onclick=ListeningTodo;
    //checkbox.style.appearance='none';
    checkbox.classList.add('forCheckbox')
    div.appendChild(label);
    const parent=document.querySelector(".taskcreate");
    parent.appendChild(div);
    
    }
}catch(error){
    console.log("error canot store data in backend");
}
}
function addTask1(value){

    const div=document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    const label=document.createElement("label");
   
    label.textContent=value;
    label.prepend(checkbox);
    checkbox.onclick=ListeningTodo;
    //checkbox.style.appearance='none';
    checkbox.classList.add('forCheckbox')
    div.appendChild(label);
    const parent=document.querySelector(".taskcreate");
    parent.appendChild(div);

}

//Delete button in TODO

function deleteTodo(){
    const checkboxes=document.querySelectorAll(".taskcreate input[type=checkbox]");
    const selectedBoxes=Array.from(checkboxes).filter(checkbox=>checkbox.checked);
    selectedBoxes.forEach(checkbox=>{
        const parentElement=checkbox.closest('li');
        if (parentElement){
            parentElement.remove();
        }
    })

    const sub=document.querySelector('.todosub');
    const deleteBtn=document.querySelector('.delete');
    const completeBtn=document.querySelector('.complete');
    sub.textContent='TO DO';
    deleteBtn.style.display='none';
    completeBtn.style.display='none';

}
//Complete button of Todo
 async function completeTodo(){
    const checkboxes=document.querySelectorAll(".taskcreate input[type=checkbox]");
    const selectedBoxes=Array.from(checkboxes).filter(checkbox=>checkbox.checked);
for (const checkbox of selectedBoxes) { // Use a for...of loop for sequential processing
    const label = checkbox.closest('label');
    if (label) {
        const truValue = label.textContent.trim(); // Get text content directly

        if (truValue !== '') {
            try {
                console.log("Posting completion for:", truValue);
               
                console.log("Deleting todo for:", truValue);
                const responseDelete = await axios.post(`http://localhost:3001/markCompleted`,
                    {       
                            value:truValue
                }
                );
                console.log("Deletion response:", responseDelete.data);

                // Create and append the new list item (consider doing this after all deletions if needed)
                const div = document.createElement('li');
                const newCheckbox = document.createElement('input');
                newCheckbox.type = 'checkbox';
                const newLabel = document.createElement("label");
                newLabel.textContent = truValue;
                newLabel.prepend(newCheckbox);
                newCheckbox.onclick = ListeningCompleted; // Ensure ListeningCompleted is defined
                newCheckbox.classList.add('forCheckbox');
                div.appendChild(newLabel);
                const parent = document.querySelector(".listele");
                parent.appendChild(div);

            } catch (error) {
                console.error("Error processing todo:", truValue, error);
            }
        }
    }
}

// Call deleteTodo() after all selected boxes have been processed
if (typeof deleteTodo === 'function') {
    deleteTodo();
} else {
    console.warn("deleteTodo function is not defined.");
}
}
function completedtask1(value){

    const div=document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    const label=document.createElement("label");
   
    label.textContent=value;
    label.prepend(checkbox);
    checkbox.onclick=ListeningTodo;
    //checkbox.style.appearance='none';
    checkbox.classList.add('forCheckbox')
    div.appendChild(label);
    const parent=document.querySelector(".listele");
    parent.appendChild(div);

}

function ListeningCompleted(){
    const deleteBtn=document.querySelector('.delete1');
    const completeBtn=document.querySelector('.complete1');
    deleteBtn.style.display='block';
    completeBtn.style.display='block';
    const checkboxes=document.querySelectorAll(".listele input[type=checkbox]");
   const selectedBoxes=Array.from(checkboxes).filter(checkbox=>checkbox.checked);
   const sub=document.querySelector('.completesub');
   if (selectedBoxes.length==0){
    sub.textContent="COMPLETED";
    deleteBtn.style.display='none';
    completeBtn.style.display='none';
}else{
    sub.textContent=`${selectedBoxes.length} Selected`;
}
}
//function to remove elements from the completed tab
async function deleteCompleted(){
    const checkboxes=document.querySelectorAll(".listele input[type=checkbox]");
    const selectedBoxes=Array.from(checkboxes).filter(checkbox=>checkbox.checked);
    selectedBoxes.forEach(checkbox=>{
        const parentElement=checkbox.closest('li');
        if (parentElement){
            parentElement.remove();
        }
    })
  
    const sub=document.querySelector('.completesub');
    const deleteBtn=document.querySelector('.delete1');
    const completeBtn=document.querySelector('.complete1');
    sub.textContent='COMPLETED';
    deleteBtn.style.display='none';
    completeBtn.style.display='none';

}
//function to put elements back from completed tab to todo tab
async function reverse(){
    console.log("reverse");
    const checkboxes=document.querySelectorAll(".listele input[type=checkbox]");
    const selectedBoxes=Array.from(checkboxes).filter(checkbox=>checkbox.checked);
    for (const checkbox of selectedBoxes) { // Use a for...of loop for sequential processing
        const label = checkbox.closest('label');
        if (label) {
            const truValue = label.textContent.trim(); // Get text content directly
    
            if (truValue !== '') {
                try {
                    console.log("Posting completion for:", truValue);
                    const responseComplete = await axios.post("http://localhost:3001/ReversetoTodo", 
                        {
                        value: truValue
                        
                    });
                    console.log("Completion response:", responseComplete.data);
    
                    console.log("Deleting todo for:", truValue);
                    // const responseDelete = await axios.delete(`http://localhost:3001/deleteComp`,
                    //     {
                            
                    //             value:truValue
                       
                    // }
                    // );
            const div=document.createElement('li');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            const label1=document.createElement("label");   
            label1.textContent=truValue;
            label1.prepend(checkbox);
            checkbox.onclick=ListeningCompleted;
            //checkbox.style.appearance='none';
            checkbox.classList.add('forCheckbox')
            div.appendChild(label1);
            const parent=document.querySelector(".taskcreate");
            parent.appendChild(div);
           

                }catch(error){
                    console.error("Error processing todo:", truValue, error);
                }
}
        }
    }
    deleteCompleted();
   
}

async function deleteCompButton(){
    const checkboxes=document.querySelectorAll(".listele input[type=checkbox]");
    const selectedBoxes=Array.from(checkboxes).filter(checkbox=>checkbox.checked);
    for (const checkbox of selectedBoxes) { // Use a for...of loop for sequential processing
        const label = checkbox.closest('label');
        if (label) {
            const truValue = label.textContent.trim(); // Get text content directly
            if (truValue !== '') {
                try {
                   
                    
    
                    console.log("Deleting completed for:", truValue);
                    const responseDelete = await axios.post(`http://localhost:3001/deleteCompleted`,
                    { 
                                value:truValue
                    }
                    );
                  
                }catch(error){
                    console.log("error occured while deleteing in completed");
                }
            }
        }
    }
    deleteCompleted();
}
async function deletetaskButton(){
    const checkboxes=document.querySelectorAll(".taskcreate input[type=checkbox]");
    const selectedBoxes=Array.from(checkboxes).filter(checkbox=>checkbox.checked);
    for (const checkbox of selectedBoxes) { // Use a for...of loop for sequential processing
        const label = checkbox.closest('label');
        if (label) {
            const truValue = label.textContent.trim(); // Get text content directly
            if (truValue !== '') {
                try {
                   
                    
    
                    console.log("Deleting todo for:", truValue);
                    const responseDelete = await axios.post(`http://localhost:3001/deletetodo`,
                        {
                                value:truValue

                    }
                    );
                  
                }catch(error){
                    console.log("error occured while deleteing in completed");
                }
            }
        }
    }
    deleteTodo();
}

async function removeCookie(){
    try{

    const response=await axios.delete("/logout");
        if(response.status==200){
            window.location.href = '/auth';
        }
    }
    catch(Error){
        console.log(Error);

    }
    
}





