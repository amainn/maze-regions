width=0
height=0

const myCanv = document.querySelector("canvas")
const ctx = myCanv.getContext("2d")

function setVal(){
    const temp_h = document.getElementById("height").value
    const temp_w = document.getElementById("width").value

    height = temp_h
    width = temp_w

    let test = []
    test = generate(width,height)
    draw2x2Maze(ctx, test, cellSize = 20) 
    drawMazeWithRegions(ctx, test, 20);

    const container = document.getElementById('answer');
    container.innerHTML = `Изолированных областей: ${Math.max(...findRegions(test).flat())}`;
}

//разндомайзер
function getRand(num){
    return Math.floor(Math.random()*num)
}

function generate(width, height){
        if((width<1)||(height<1)) return null

        const H = height*2 + 1
        const W = width*2 + 1

        let maze = []

        //пустая рамка 
        for(let i = 0; i<H; ++i){
            const row = []
            for(let j = 0; j<W; ++j){
                if((i%2 == 1) && (j%2==1)) row.push(' ')
                else if(((i%2 == 1) && (j%2 == 0) && (j != 0) && (j != W-1)) || ((j%2 == 1) && (i%2 == 0) && (i != 0) && (j != H-1))) row.push(' ')
                else row.push('#')
            }
            maze.push(row)
        }

        const row_set = [] //содержание мн-ва
        let count = 1
        for(let i = 0; i<width; i++){
            row_set.push(0) //заполняем нулями - ячейка не принадлежит мн-ву
        }

        //алгоритм Эллера
        for(let i = 0; i<height; ++i){
            for(let j = 0; j<width; ++j){
                if(row_set[j] === 0) row_set[j] = count++ //уникальное множество каждому числу
            }
            //создаем первые стены, движемся слева направо
            for(let j = 0; j<width-1; ++j){
                //0 - стены нет, 1 - стена есть
                const right = getRand(2)
                if((right === 1) || (row_set[j] === row_set[j+1])) maze[i*2 + 1][j*2 + 2] = '#'
                else{
                    const change_set = row_set[j+1]
                    for(let k = 0; k<width; ++k){
                        if(row_set[k] === change_set) row_set[k] = row_set[j]
                    }
                }
            }

            //создаем нижние стены, движемся слева направо
            for(let j=0; j<width; ++j){
                const down = getRand(2)
                let current_set = 0 //число - единственный элемент мн-ва
                for(let k= 0; k<width; ++k){
                    //считаем длину мн-ва
                    if(row_set[k] === row_set[j]) current_set++
                }

                if((down===1) && (current_set != 1)) maze[i*2 + 2][j*2 + 1] = '#'
            }

            if(i != height-1){
                for(let j = 0; j<width; ++j){
                    if((maze[i*2+2][j*2 + 1]) === '#') row_set[j] = 0
                }
            }
        }

        //закончить лабиринт
        for(let j=0; j<width-1; ++j){
            if(row_set[j] != row_set[j+1]) maze[H-2][j*2 + 2] = ' '
            const change_set = row_set[j+1]
            for(let k=j+1; k<width; ++k){
                if(row_set[k] === change_set) row_set[k] = row_set[j]
            }
        }

        for(let j = 0; j < width; ++j) {
            maze[H - 1][j * 2 + 1] = '#';
        }

        return maze
    }

function draw2x2Maze(ctx, maze, cellSize) {
    const rows = maze.length;
    const cols = maze[0].length;
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const x = j * cellSize;
            const y = i * cellSize;
            
            // Стена
            if (maze[i][j] === '#') {
                ctx.fillStyle = '#000000';
                ctx.fillRect(x, y, cellSize, cellSize);
            } 
            // Проход
            else if (maze[i][j] === ' ') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x, y, cellSize, cellSize);
            }
        }
    }
} 


function drawMazeWithRegions(ctx, maze, cellSize) {
    if (!maze) return;
    
    const rows = maze.length;
    const cols = maze[0].length;

    const regions = findRegions(maze);
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const colors = [
        '#E67E22', 
        '#3498DB', 
        '#2ECC71', 
        '#E74C3C', 
        '#9B59B6', 
        '#F1C40F', 
        '#1ABC9C', 
        '#E67E22', 
        '#34495E', 
        '#27AE60', 
        '#F39C12', 
        '#8E44AD', 
        '#16A085', 
        '#D35400', 
        '#2980B9', 
        '#C0392B', 
        '#7F8C8D', 
        '#F5B041', 
        '#5DADE2', 
        '#58D68D'  
    ];
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const x = j * cellSize;
            const y = i * cellSize;
            
            if (maze[i][j] === '#') {
                ctx.fillStyle = '#000000';
                ctx.fillRect(x, y, cellSize, cellSize);
            } else {
                const regionId = regions[i][j] || 0;
                ctx.fillStyle = colors[regionId % colors.length];
                ctx.fillRect(x, y, cellSize, cellSize);
            }
        }
    }
}

function findRegions(maze) {
    const rows = maze.length;
    const cols = maze[0].length;
    const regions = Array(rows).fill().map(() => Array(cols).fill(0));
    
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    let regionId = 0;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (maze[i][j] === ' ' && regions[i][j] === 0) {
                regionId++;
                
                const queue = [[i, j]];
                regions[i][j] = regionId;
                
                while (queue.length > 0) {
                    const [row, col] = queue.shift();
                    
                    for (const [dr, dc] of directions) {
                        const newRow = row + dr;
                        const newCol = col + dc;
                        
                        if (newRow >= 0 && newRow < rows && 
                            newCol >= 0 && newCol < cols && 
                            maze[newRow][newCol] === ' ' && 
                            regions[newRow][newCol] === 0) {
                            
                            regions[newRow][newCol] = regionId;
                            queue.push([newRow, newCol]);
                        }
                    }
                }
            }
        }
    }
    
    return regions;
}
