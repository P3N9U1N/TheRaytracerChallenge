/**
 * Merges 2 sorted regions in an array into 1 sorted region (in-place without extra memory, stable) 
 * @param items array to merge
 * @param left left array boundary inclusive
 * @param middle boundary between regions (left region exclusive, right region inclusive)
 * @param right right array boundary exclusive
 */
 function mergeInplace<T>(items: T[], compareFn: (a: T,b: T )=> number,left:number,middle:number, right:number) {
    if (right==middle) return;
    for (var i = left; i < middle;i++) {
         
        var minRight=items[middle];
        if(compareFn(minRight, items[i]) <0)
        {
            var tmp=items[i];
            items[i] =minRight;
            var nextItem:T;
            var next=middle+1;
            while(next<right&& compareFn((nextItem=items[next]),tmp)<0)
            {              
              items[next-1]=nextItem;
              next++;
            } 
            items[next-1]=tmp;                
        }    
    }
}

/**
 * In-place bottom up merge sort
 */
export function mergeSortInplace<T>(items: T[], compareFn: (a: T,b: T )=> number,from?:number,to?:number) {
    from??=0;
    to??=items.length;
    var maxStep = (to-from) * 2;   
    for (var step = 2; step < maxStep;step*=2) {
        var oldStep=step/2;
        for (var x = from; x < to; x += step) {
        
         mergeInplace(items,compareFn,x, x+oldStep,Math.min(x+step,to) );
        }       
    }


}

