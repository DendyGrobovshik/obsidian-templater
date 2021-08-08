# Obsidian Templater Plugin

Plugin to use some notes as templates within other notes

## How o use
- Create the template - note with HTML inside. Variables in the template are marked with `$`
- Create a note and import template using `%`

# Example
### TEMPLATE_NAME.md
```
His name is $name$ and age is $age$
```

### PERSON_CARD.md
```
---
name: John Doe
age: 77
---

%TEMPLATE_NAME%
```

# TODO
- Refactoring
- Сoloring template import
- Ability to perform mathematical operations