## BUG: 1 

# 'AllServicesView'

Editing OR removing a service from _AirportTransfer_ affects ALL other serivces.

That is:

Editing: Changes All services to be the same as the one that was edited.
Remmoving: Removes all services.

**Analysis Notes:**
This likely occurs due to cache isolation issues in the AllServicesView component. Possible causes:
1. **Reference Mutation**: All services may be sharing the same object reference instead of being properly cloned
2. **Cache Key Confusion**: The edit/remove operations might be updating the wrong cache key or affecting multiple cache keys simultaneously
3. **State Management Issue**: The unified services array in AllServicesView may not properly maintain separation between AT/ST/MBT service origins
4. **Date-specific Cache Problems**: Edit operations might be affecting the global cache instead of the date-specific cache, causing cross-contamination between service types
5. **Array Reference Issue**: The services array might be directly mutated rather than using immutable update patterns, causing all components to reflect the same changes 

You have tried to correct this bug multiple times and being unable to. Now, the most obvious reason is that the object gets corrupted
and that shows on rerender. I confirmed by seeing the localstorage object being altered like that. Whatever function is doing this
is not updating the specific service but rather the whole thing somehow. 

# FEATURE 1

We need to add a 'add new service' in the All Services Subsection. Possibly in the bottom bar most rather. 
For this, allow a form as we do in MBT and a parser for a message like this:

SALIDA 
PUJ-PCAT-11692 
Pedro Scala 
Kia K5 
2 Pax 
Desde: Serenade All Suites, Adults Only Resort 
Fecha: 2025-11-10 
Hora: 18:30
Hacia: Punta Cana Airport

Always the same structure, you get the following information:

type -> SALIDA 
code -> PUJ-PCAT-11692 
client -> Pedro Scala 
vehicule -> Kia K5 
PAX -> 2 Pax 
FROM -> Desde: Serenade All Suites, Adults Only Resort 
DATE -> Fecha: 2025-11-10 
TIME -> Hora: 18:30
TO -> Hacia: Punta Cana Airport

The parser should read it and allow to add the service directly, maybe even allowing
edit-on right there before updating right away (to like add things like the company).


