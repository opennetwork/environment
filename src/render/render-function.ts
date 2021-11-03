import { VNode } from "@virtualstate/fringe";

export interface RenderProps extends Record<string, any> {

}
export interface RenderFunction {
    (props: RenderProps): VNode
}
