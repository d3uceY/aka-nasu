Unicode true

####
## Please note: Template replacements don't work in this file. They are provided with default defines like
## mentioned underneath.
## If the keyword is not defined, "wails_tools.nsh" will populate them.
## If they are defined here, "wails_tools.nsh" will not touch them. This allows you to use this project.nsi manually
## from outside of Wails for debugging and development of the installer.
## 
## For development first make a wails nsis build to populate the "wails_tools.nsh":
## > wails build --target windows/amd64 --nsis
## Then you can call makensis on this file with specifying the path to your binary:
## For a AMD64 only installer:
## > makensis -DARG_WAILS_AMD64_BINARY=..\..\bin\app.exe
## For a ARM64 only installer:
## > makensis -DARG_WAILS_ARM64_BINARY=..\..\bin\app.exe
## For a installer with both architectures:
## > makensis -DARG_WAILS_AMD64_BINARY=..\..\bin\app-amd64.exe -DARG_WAILS_ARM64_BINARY=..\..\bin\app-arm64.exe
####
## The following information is taken from the wails_tools.nsh file, but they can be overwritten here.
####
## !define INFO_PROJECTNAME    "my-project" # Default "aka-nasu"
## !define INFO_COMPANYNAME    "d3uceY" # Default "d3uceY"
## !define INFO_PRODUCTNAME    "aka-nasu" # Default "aka-nasu"
## !define INFO_PRODUCTVERSION "1.0.0"     # Default "0.1.0"
## !define INFO_COPYRIGHT      "© 2026 d3uceY" # Default "© 2026 d3uceY"
###
## !define PRODUCT_EXECUTABLE  "Application.exe"      # Default "${INFO_PROJECTNAME}.exe"
## !define UNINST_KEY_NAME     "UninstKeyInRegistry"  # Default "${INFO_COMPANYNAME}${INFO_PRODUCTNAME}"
####
## !define REQUEST_EXECUTION_LEVEL "admin"            # Default "admin"  see also https://nsis.sourceforge.io/Docs/Chapter4.html
## !define WAILS_INSTALL_SCOPE     "user"             # Default "machine" - set to "user" for per-user install ($LOCALAPPDATA) without UAC prompt
####
## Include the wails tools
####
!include "wails_tools.nsh"

# The version information for this two must consist of 4 parts
VIProductVersion "${INFO_PRODUCTVERSION}.0"
VIFileVersion    "${INFO_PRODUCTVERSION}.0"

VIAddVersionKey "CompanyName"     "${INFO_COMPANYNAME}"
VIAddVersionKey "FileDescription" "${INFO_PRODUCTNAME} Installer"
VIAddVersionKey "ProductVersion"  "${INFO_PRODUCTVERSION}"
VIAddVersionKey "FileVersion"     "${INFO_PRODUCTVERSION}"
VIAddVersionKey "LegalCopyright"  "${INFO_COPYRIGHT}"
VIAddVersionKey "ProductName"     "${INFO_PRODUCTNAME}"

# Enable HiDPI support. https://nsis.sourceforge.io/Reference/ManifestDPIAware
ManifestDPIAware true

!include "MUI.nsh"

!define MUI_ICON "..\icon.ico"
!define MUI_UNICON "..\icon.ico"
# !define MUI_WELCOMEFINISHPAGE_BITMAP "resources\leftimage.bmp" #Include this to add a bitmap on the left side of the Welcome Page. Must be a size of 164x314
!define MUI_FINISHPAGE_NOAUTOCLOSE # Wait on the INSTFILES page so the user can take a look into the details of the installation steps
!define MUI_ABORTWARNING # This will warn the user if they exit from the installer.
# Launch via explorer.exe so the app starts de-elevated (user token, not admin).
# MUI_FINISHPAGE_RUN would inherit the installer's elevated token and start the
# app as administrator, which breaks per-user behaviour.
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_FUNCTION LaunchAsUser
!define MUI_FINISHPAGE_RUN_TEXT "Launch ${INFO_PRODUCTNAME}"

!insertmacro MUI_PAGE_WELCOME # Welcome to the installer page.
# !insertmacro MUI_PAGE_LICENSE "resources\eula.txt" # Adds a EULA page to the installer
!insertmacro MUI_PAGE_DIRECTORY # In which folder install page.
!insertmacro MUI_PAGE_INSTFILES # Installing page.
!insertmacro MUI_PAGE_FINISH # Finished installation page.

!insertmacro MUI_UNPAGE_INSTFILES # Uninstalling page

!insertmacro MUI_LANGUAGE "English" # Set the Language of the installer

## The following two statements can be used to sign the installer and the uninstaller. The path to the binaries are provided in %1
#!uninstfinalize 'signtool --file "%1"'
#!finalize 'signtool --file "%1"'

Name "${INFO_PRODUCTNAME}"
OutFile "..\..\bin\${INFO_PROJECTNAME}-${ARCH}-installer.exe" # Name of the installer's file.
!if "${WAILS_INSTALL_SCOPE}" == "user"
    InstallDir "$LOCALAPPDATA\Programs\${INFO_PRODUCTNAME}"
!else
    InstallDir "$PROGRAMFILES64\${INFO_COMPANYNAME}\${INFO_PRODUCTNAME}"
!endif
ShowInstDetails show # This will always show the installation details.

# Launch the freshly installed app as the current (non-elevated) user.
Function LaunchAsUser
    # explorer.exe sheds the installer's admin token and starts the app as the
    # current user, so the app never inherits the installer's elevated token.
    Exec '"$WINDIR\explorer.exe" "$INSTDIR\${PRODUCT_EXECUTABLE}"'
FunctionEnd

# StrStr: Push <needle>, Push <haystack>, Call StrStr, Pop <result>.
# Returns the part of the haystack starting at the first match, or "" if the
# needle isn't found. Standard NSIS helper — no plugin required.
Function StrStr
  Exch $R0
  Exch
  Exch $R1
  Push $R2
  Push $R3
  Push $R4
  StrLen $R3 $R0
  StrCpy $R4 0
  loop:
    StrCpy $R2 $R1 $R3 $R4
    StrCmp $R2 $R0 found
    StrCmp $R2 "" notfound
    IntOp $R4 $R4 + 1
    Goto loop
  found:
    StrCpy $R0 $R1 "" $R4
    Goto done
  notfound:
    StrCpy $R0 ""
  done:
    Pop $R4
    Pop $R3
    Pop $R2
    Pop $R1
    Exch $R0
FunctionEnd

# If the app is already running when the installer starts, close it before we
# overwrite the binary (a running exe can't be replaced on Windows). Detection
# is by executable image name, not window title — the title ("Aka Nasu") does
# not match INFO_PRODUCTNAME, but the image name always does. tasklist is
# locale-safe: when nothing matches, its output never contains the image name.
Function closeRunningApp
    nsExec::ExecToStack 'tasklist /FI "IMAGENAME eq ${PRODUCT_EXECUTABLE}"'
    Pop $0                     ; tasklist exit code (unused)
    Pop $1                     ; tasklist output
    Push $1
    Push "${PRODUCT_EXECUTABLE}"
    Call StrStr
    Pop $2                     ; non-empty when the app is running
    StrCmp $2 "" notRunning

    ; Never block a silent install (/S) with a prompt — just close the app.
    IfSilent doClose
    MessageBox MB_YESNO|MB_ICONQUESTION|MB_DEFBUTTON1 \
        "${INFO_PRODUCTNAME} is currently running. It must be closed before installation can continue.$\n$\nClose ${INFO_PRODUCTNAME} now?" \
        IDYES doClose
    Abort ; User chose No — cancel the installation.

    doClose:
        DetailPrint "Closing ${INFO_PRODUCTNAME}..."
        ExecWait 'taskkill /IM "${PRODUCT_EXECUTABLE}" /T'      ; graceful close
        Sleep 1500
        ExecWait 'taskkill /F /IM "${PRODUCT_EXECUTABLE}" /T'   ; force, if it lingered
        Sleep 500

    notRunning:
FunctionEnd

Function .onInit
   !insertmacro wails.checkArchitecture
   Call closeRunningApp
FunctionEnd

Section
    !insertmacro wails.setShellContext

    !insertmacro wails.webview2runtime

    SetOutPath $INSTDIR
    
    !insertmacro wails.files

    CreateShortcut "$SMPROGRAMS\${INFO_PRODUCTNAME}.lnk" "$INSTDIR\${PRODUCT_EXECUTABLE}"
    CreateShortCut "$DESKTOP\${INFO_PRODUCTNAME}.lnk" "$INSTDIR\${PRODUCT_EXECUTABLE}"

    !insertmacro wails.associateFiles
    !insertmacro wails.associateCustomProtocols
    
    !insertmacro wails.writeUninstaller
SectionEnd

Section "uninstall" 
    !insertmacro wails.setShellContext

    RMDir /r "$AppData\${PRODUCT_EXECUTABLE}" # Remove the WebView2 DataPath

    RMDir /r $INSTDIR

    Delete "$SMPROGRAMS\${INFO_PRODUCTNAME}.lnk"
    Delete "$DESKTOP\${INFO_PRODUCTNAME}.lnk"

    !insertmacro wails.unassociateFiles
    !insertmacro wails.unassociateCustomProtocols

    !insertmacro wails.deleteUninstaller
SectionEnd
