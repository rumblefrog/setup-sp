#include <sourcemod>

#pragma semicolon 1
#pragma newdecls required

#if !defined __sourcepawn2
    #error Expected the SourcePawn 2 compiler
#endif

public void OnPluginStart()
{
    PrintToServer("SourcePawn 2");
}
