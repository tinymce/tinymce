API
========

Data Types
-----------

WordScope:

* word: String
* left: Option[String]
* right: Option[String]

Cluster:

* zone: Zone
* words: List[WordScope]

Zone:

* elements => List[Element]



LeftBlock
----------

    top(e: Element): List[Element]

    all(e: Element): List[Element]


Words
-----

    identify(s: String): List[WordScope]


    cluster(e: Element): Cluster


Zone
----

    constant(xs: List[Element]): Zone

    lazy(parent: Element): Zone


Grouping
--------

    text(e: Element): List[List[Element]]
