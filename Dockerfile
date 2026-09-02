FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY DocumentEditor.Api/DocumentEditor.Api.csproj DocumentEditor.Api/
RUN dotnet restore DocumentEditor.Api/DocumentEditor.Api.csproj

COPY . .
WORKDIR /src/DocumentEditor.Api
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "DocumentEditor.Api.dll"]