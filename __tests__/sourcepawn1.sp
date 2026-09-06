#include <sourcemod>

#pragma semicolon 1
#pragma newdecls required

#if defined __sourcepawn2
    #error Expected the SourcePawn 1 compatibility compiler
#endif

void FormatMessage(char[] buffer, int maxLength, const char[] format, any ...)
{
    VFormat(buffer, maxLength, format, 4);
}

public void OnPluginStart()
{
    char buffer[64];
    FormatMessage(buffer, sizeof(buffer), "%s", "SourcePawn 1");
    PrintToServer("%s", buffer);
}
