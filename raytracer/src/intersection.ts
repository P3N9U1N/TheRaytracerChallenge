import { ObjectPool } from "./collection"
import {mergeSortInplace} from "./sort"
import { IShape } from "./world";
export class Intersection {
    t: number;
    object: IShape;
    constructor(t: number, object: any) {

        this.t = t;
        this.object = object;
    }
    equals(intersection: Intersection): boolean {
        return this.t == intersection.t && this.object === intersection.object;
    }
}

export class Intersections extends ObjectPool<Intersection> {

    private static sortIntersection(a:Intersection ,b:Intersection):number
    {
        return a.t-b.t;
    }


    protected create(): Intersection {
        return new Intersection(0, null);
    }
    /**
     * Get hit, regardless of sort
    */
    hit(): Intersection {
        var hit: Intersection = null;
        for (var i = 0; i < this._length; i++) {
            var item = this.items[i];
            if ((hit == null || item.t < hit.t) && item.t > 0) hit = item;
        }
        return hit;
    }
    /**
     * Get hit in a sorted intersections list
    */
    firstHit()
    {       
        for (var i = 0; i < this._length; i++) {
            var item = this.items[i];
            if (item.t > 0) return item;
        }
        return null;
    }
    sort(): void {       
        mergeSortInplace(this.items,Intersections.sortIntersection,0,this._length);
        for (var i = 0; i < this._length; i++) {
            this.indexMap.set(this.items[i], i);
        }
    }
    equals(intersections: Intersections): boolean {
        if (this._length != intersections.length) return false;
        for (var i = 0; i < this._length; i++) {
            if (!this.items[i].equals(intersections.items[i])) return false;
        }
        return false;
    }
}
