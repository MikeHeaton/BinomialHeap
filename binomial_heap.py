"""
Implementation of a binomial heap


By Mike 18/11/16
"""

class Node():
    def __init__(self, val):
        self.val = val
        self.parent = None
        self.child = None
        self.sibling = None
        self.order = 0
        self.neginf = False

    def less(self, node2):
        # Checks whether node < node2, including comparison of neginfs.
        if self.neginf and not node2.neginf:
            return True
        elif node2.neginf:
            return False
        else:
            return (self.val < node2.val)

    def __str__(self):
        return "(" + self.val + ")"

class BinomialHeap():
    def __init__(self, roots):
        # Binomial heap is just a list of root nodes.
        self.roots = roots
    
    def bubble(self, node):
        # Resorts the tree that node belongs to by 'bubbling' it up the tree.
        if node.parent is None:
            return

        if node.less(node.parent):
            print("Swapping {:d} with {:d}".format(node.val, node.parent.val))
            tempparent = node.parent.parent
            tempsibling = node.parent.sibling

            node.parent.parent = node
            node.parent.child = node.child
            node.parent.sibling = node.sibling

            node.child = node.parent
            node.sibling = tempsibling
            node.parent = tempparent

            self.bubble(node)

    def decrease(self, node, newval):
        # Decreases node's value to newval and resorts the tree it belongs to.
        if node.val <= newval:
            print("Error, not a decrease.")
        else:
            node.val = newval
            self.bubble(node)

    def insert(self, node):
        # Inserts a new node into the heap and resorts.
        newheap = BinomialHeap([node])
        self.union(newheap)

    def delete(self, node):
        # Deletes the node
        node.neginf = True
        self.bubble(node)
        self._removeroot(node)
   
    def _removeroot(self, node):
        # Removes a node from the tree if it's a root node.
        if node.parent is not None:
            print("Error, node is not a root node.")
            return
        else:
            children = []
            c = node.child
            while c is not None:
                children.append(c)
                c = c.sibling
            newheap = BinomialHeap(children)
            self.roots.remove(node)
            self.union(newheap)

    def findmin(self):
        # Identifies the min node 
        return min(self.roots, key=(lambda n:n.val))

    def extractmin(self):
        # Identifies the minimum node; deletes it from the tree; returns it.
        minnode = self.findmin()
        self._removeroot(minnode)
        return minnode

    def union(self, heapB):
        # Unions the heap with another binomial heap and resorts everything.
        self.roots = self.roots + heapB.roots
        newroots = []
        orderdict = {}

        def tryadd(root):
            if not root.order in orderdict:
                newroots.append(root)
                orderdict[root.order] = root
            else:
                # Identify the other tree to be merged 
                ex_root = orderdict[root.order]
                del orderdict[root.order]
                newroots.remove(ex_root)
                # NOTE use of remove adds another O(log n) step - does this make
                # it more complex???
                # Merge them
                if root.val <= ex_root.val:
                    newroot = root
                    newchild = ex_root
                else:
                    newroot = ex_root
                    newchild = root
                newchild.parent = newroot
                newchild.sibling = newroot.child
                newroot.child = newchild
                newroot.order += 1
                tryadd(newroot) 

        for root in self.roots:
            tryadd(root) 
        
        self.roots = newroots

x0 = Node(0)
x1 = Node(1)
x2 = Node(2)
heap = BinomialHeap([x0,x1,x2])
heap.union(BinomialHeap([]))
print(heap.roots)
